import React, { useCallback, useEffect, useRef } from 'react';
import autosize from 'autosize';
import gravatar from 'gravatar';
import { Mention } from 'react-mentions';
import { useParams } from 'react-router-dom';
import useSWR from 'swr';
import { IUser } from 'typings/db';
import fetcher from 'utils/fetcher';
import { ChatArea, EachMention, Form, MentionsTextarea, SendButton, Toolbox } from './ChatBox.styles';
import { ChatBoxProps } from './ChatBox.types';

export default function ChatBox({ chat, onSubmitForm, onChangeChat, placeholder }: ChatBoxProps) {
  const { data: userData } = useSWR<IUser | false>('http://localhost:3095/api/users', fetcher, {
    dedupingInterval: 2000,
  });

  const { workspace } = useParams<{ workspace: string }>();

  const { data: memberData } = useSWR<IUser[]>(`http://localhost:3095/api/workspaces/${workspace}/members`, fetcher, {
    dedupingInterval: 2000,
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (textareaRef.current) {
      autosize(textareaRef.current);
    }
  }, []);

  const onKeyDownChat = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        if (!e.shiftKey) {
          e.preventDefault();
          onSubmitForm(e);
        }
      }
    },
    [onSubmitForm],
  );

  // const renderSuggestion = useCallback(
  //   (highlightedDisplay: React.ReactNode, index: number, focus: boolean): React.ReactNode => {
  //     if (!memberData) return;

  //     return (
  //       <EachMention focus={focus}>
  //         <img
  //           src={gravatar.url(memberData[index].email, { s: '20px', d: 'retro' })}
  //           alt={memberData[index].nickname}
  //         />
  //         <span>{highlightedDisplay}</span>
  //       </EachMention>
  //     );
  //   },
  //   [memberData],
  // );

  return (
    <ChatArea>
      <Form onSubmit={onSubmitForm}>
        <MentionsTextarea
          id="editor-chat"
          value={chat}
          onChange={onChangeChat}
          onKeyPress={onKeyDownChat}
          placeholder={placeholder}
          inputRef={textareaRef}
        >
          <Mention
            appendSpaceOnAdd
            trigger="@"
            data={memberData?.map((v) => ({ id: v.id, display: v.nickname })) || []}
            // renderSuggestion={renderSuggestion}
          />
        </MentionsTextarea>
        <Toolbox>
          <SendButton
            className={`c-button-unstyled c-icon_button c-icon_button--light c-icon_button--size_medium c-texty_input__button c-texty_input__button--send${
              chat?.trim() ? '' : ' c-texty_input__button--disabled'
            }`}
            data-qa="texty_send_button"
            aria-label="Send message"
            data-sk="tooltip_parent"
            type="submit"
            disabled={!chat?.trim()}
          >
            <i className="c-icon c-icon--paperplane-filled" aria-hidden="true" />
          </SendButton>
        </Toolbox>
      </Form>
    </ChatArea>
  );
}

ChatBox.defaultProps = {
  placeholder: '',
};
