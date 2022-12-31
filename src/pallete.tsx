import { Action, ActionPanel, Clipboard, List, LocalStorage, Icon, closeMainWindow, showToast } from "@raycast/api";
import { useCallback, useEffect, useState } from "react";

type Value = {
  title: string;
  value: string;
};

export default () => {
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [defaultItems, setDefaultItems] = useState([]);
  const [items, setItems] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const itemJson = await LocalStorage.getItem<string>("pallete_clipboard_items");
        const items = JSON.parse(itemJson ?? "[]");
        setDefaultItems(items);
        setItems(items);
        setLoading(false);
      } catch (err) {
        console.error(err);
        await showToast({ title: `Error: ${err}` });
      }
    })();
  }, []);

  useEffect(() => {
    if (!searchText) {
      setItems(defaultItems);
    } else {
      setItems(
        defaultItems.filter((i: Value) => [i.title, i.value].join("").toLowerCase().includes(searchText.toLowerCase()))
      );
    }
  }, [searchText, defaultItems]);

  const deletePallete = useCallback(
    async ({ title }: Value) => {
      try {
        const newItems = defaultItems.filter((i: Value) => i.title !== title);
        setDefaultItems(newItems);
        await LocalStorage.setItem("pallete_clipboard_items", JSON.stringify(newItems));
      } catch (err) {
        await showToast({ title: `Error: ${err}` });
      }
    },
    [defaultItems]
  );

  return (
    <List
      isLoading={loading}
      filtering
      navigationTitle="Search Pallete"
      searchBarPlaceholder="Search a value to copy..."
      onSearchTextChange={setSearchText}
    >
      {items.map((item: Value) => (
        <List.Item
          key={item.title}
          title={item.title}
          subtitle={item.value}
          actions={
            <ActionPanel>
              <Action.CopyToClipboard
                title="Copy"
                content={item.value}
                onCopy={() => closeMainWindow({ clearRootSearch: true })}
              />
              <Action.Paste
                title="Paste"
                content={item.value}
                onPaste={() => closeMainWindow({ clearRootSearch: true })}
              />
              <Action
                icon={Icon.Trash}
                title="Delete"
                shortcut={{ modifiers: ["cmd"], key: "backspace" }}
                onAction={() => deletePallete(item)}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
};
