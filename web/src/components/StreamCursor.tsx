import React from 'react';

interface Props {
  visible: boolean;
}

const StreamCursor: React.FC<Props> = ({ visible }) => {
  if (!visible) {
    return (
      <span
        className="stream-dots"
        style={{
          display: 'inline-block',
          color: 'var(--color-text-tertiary)',
          letterSpacing: 2,
        }}
      >
        •••
      </span>
    );
  }

  return (
    <span
      className="stream-cursor"
      style={{
        display: 'inline',
        color: 'var(--color-primary)',
        fontWeight: 700,
        fontSize: '1.1em',
      }}
    >
      ▍
    </span>
  );
};

export default StreamCursor;
