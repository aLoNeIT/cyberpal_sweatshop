import React, { useState } from 'react';
import { Collapse } from 'antd';
import { BulbOutlined, CaretRightOutlined } from '@ant-design/icons';

interface Props {
  thinking: string;
}

const ThinkingBlock: React.FC<Props> = ({ thinking }) => {
  const [open, setOpen] = useState(false);

  const items = [{
    key: '1',
    label: (
      <span style={{ fontSize: 13, fontWeight: 500 }}>
        💡 思考过程
        <span style={{ color: 'var(--color-text-tertiary)', marginLeft: 8, fontSize: 12, fontWeight: 400 }}>
          {thinking.slice(0, 50)}{thinking.length > 50 ? '…' : ''}
        </span>
      </span>
    ),
    children: (
      <pre style={{
        fontSize: 12,
        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
        background: 'var(--color-surface-2)',
        color: 'var(--color-text-secondary)',
        padding: 12,
        borderRadius: 6,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        margin: 0,
        maxHeight: 300,
        overflow: 'auto',
      }}>
        {thinking}
      </pre>
    ),
  }];

  return (
    <Collapse
      activeKey={open ? ['1'] : []}
      onChange={(keys) => setOpen(keys.includes('1'))}
      items={items}
      bordered={false}
      expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
      style={{ background: 'transparent' }}
      size="small"
    />
  );
};

export default ThinkingBlock;
