import { Action, ActionPanel, Form, LocalStorage, showToast } from "@raycast/api";
import { useEffect, useState } from "react";

export default () => {
  const [loading, setLoading] = useState(false);
  const [defaultItems, setDefaultItems] = useState([]);
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const itemJson = await LocalStorage.getItem<string>("pallete_clipboard_items");
        const items = JSON.parse(itemJson ?? "[]");
        setDefaultItems(items);
        setLoading(false);
      } catch (err) {
        console.error(err);
        await showToast({ title: `Error: ${err}` });
      }
    })();
  }, []);

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm
            onSubmit={async (values) => {
              if (!values.title || !values.value) {
                return;
              }

              if (defaultItems.some((i: any) => i.title === values.title)) {
                await showToast({ title: "Entry already exists" });
                return;
              }

              setDefaultItems([...defaultItems, values] as any);
              setLoading(true);
              await LocalStorage.setItem("pallete_clipboard_items", JSON.stringify([...defaultItems, values]));
              await showToast({ title: "Added new pallete!" });
              setLoading(false);
              setTitle("");
              setValue("");
            }}
          />
        </ActionPanel>
      }
    >
      <Form.TextField id="title" title="Title" placeholder="Enter a title" onChange={setTitle} value={title} />
      <Form.TextArea id="value" title="Value" placeholder="Enter a value" onChange={setValue} value={value} />
    </Form>
  );
};
