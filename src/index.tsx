/* eslint-disable no-irregular-whitespace */
import { Action, ActionPanel, Clipboard, getSelectedText, Icon, LaunchProps, List } from "@raycast/api";
import React from "react";
import xhyx from "../config/xhyx.json";
import fontCodeMap from "../config/font-code-map.json";

export default function Command(props: LaunchProps) {
  const [input, setInput] = React.useState(props.arguments.title);

  const [decoded, setDecoded] = React.useState<
    { title: string; subtitle?: string; icon?: string; link?: string }[] | undefined
  >(undefined);

  const search = (text?: string) => {
    const searchText = text || input;

    if (!searchText) return;
    const data = (xhyx as any)[searchText];
    const fontCode = (fontCodeMap as any)[searchText];

    const getItems = () => {
      if (data === "未收录") {
        return [
          {
            title: `${searchText}： 未收录的字`,
            subtitle: "非《通用规范汉字表》国发〔2013〕23号文规定用字，故未收录",
          },
        ];
      } else if (data && data.length > 0) {
        return [
          {
            title: `${data[0]}`,
            icon: Icon.Hashtag,
          },
          {
            title: `拆分：${data[1]}`,
          },
          {
            title: `首末：${data[2]} ${data[3]}`,
          },
          {
            title: `编码：${data[4]} ${data[5]}`,
          },
          {
            title: `汉典`,
            subtitle: `https://www.zdic.net/hans/${searchText}`,
            link: `https://www.zdic.net/hans/${encodeURI(searchText)}`,
            icon: Icon.Link,
          },
        ];
      } else {
        if (fontCode) {
          const code = fontCode.split(",");
          return [
            {
              title: `编码：${code[0]}`,
            },
            {
              title: `位置：${code[1]}`,
            },
          ];
        }

        return [
          {
            title: `错误：\`${searchText}\` 不存在反查词典中`,
          },
        ];
      }
    };

    setDecoded(getItems());
  };

  const isFirstMount = React.useRef(true);

  React.useEffect(() => {
    if (isFirstMount.current) {
      Clipboard.readText()
        .then((text) => {
          console.log('clipboard', text)
          if (text && text.length === 1) {
            search(text);
          }
          setInput(text)
        })
        .catch(() => {});

      isFirstMount.current = false;
    }
  }, []);



  return (
    <List
      searchText={input}
      searchBarAccessory={
        <ActionPanel>
          <Action
            title={"Emit Search"}
            shortcut={{ modifiers: [], key: "enter" }}
            onAction={() => {
              search();
            }}
          />
        </ActionPanel>
      }
      onSearchTextChange={(newValue) => {
        setInput(newValue);
        console.log('newValue', newValue)
        if (newValue.length === 1) {
          search(newValue);
        }
      }}
      searchBarPlaceholder={"请输入..."}
    >
      {decoded ? (
        decoded.map((item) => (
          <List.Item
            key={item.title}
            title={item.title}
            subtitle={item.subtitle}
            icon={item.icon || Icon.ChevronRight}
            actions={
              item.link ? (
                <ActionPanel>
                  <Action.OpenInBrowser url={item.link} />
                </ActionPanel>
              ) : null
            }
          />
        ))
      ) : (
        <List.EmptyView
          icon={Icon.QuestionMarkCircle}
          title={"请输入关键词进行查询"}
          // description={"请复制关键词进行"}
        />
      )}
    </List>
  );
}
