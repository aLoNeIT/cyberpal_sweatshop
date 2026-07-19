import React, { useState } from 'react';
import { Tag, Collapse, Tabs, Button } from 'antd';
import { ToolOutlined, LoadingOutlined, CheckCircleOutlined, CloseCircleOutlined, CaretRightOutlined } from '@ant-design/icons';

interface ToolCall {
  call_id: string;
  name: string;
  params?: any;
  result?: any;
  success?: boolean;
  status: 'executing' | 'done';
}

interface Props {
  tool: ToolCall;
}

const ToolCallBlock: React.FC<Props> = ({ tool }) => {
  const [open, setOpen] = useState(tool.status === 'executing');
  const [resultExpanded, setResultExpanded] = useState(false);

  const isExecuting = tool.status === 'executing';
  const isError = tool.success === false;

  const statusIcon = isExecuting ? (
    <LoadingOutlined spin style={{ color: 'var(--color-info)' }} />
  ) : isError ? (
    <CloseCircleOutlined style={{ color: 'var(--color-danger)' }} />
  ) : (
    <CheckCircleOutlined style={{ color: 'var(--color-success)' }} />
  );

  const statusTag = isExecuting ? (
    <Tag color="processing" style={{ fontSize: 11 }}>执行中</Tag>
  ) : isError ? (
    <Tag color="error" style={{ fontSize: 11 }}>失败</Tag>
  ) : (
    <Tag color="success" style={{ fontSize: 11 }}>成功</Tag>
  );

  const resultStr = tool.result != null
    ? (typeof tool.result === 'string' ? tool.result : JSON.stringify(tool.result, null, 2))
    : null;

  const items = [{
    key: '1',
    label: (
      <span style={{ fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
        {statusIcon}
        <span>🔧 {tool.name}</span>
        {statusTag}
      </span>
    ),
    children: (
      <Tabs
        size="small"
        items={[
          {
            key: 'params',
            label: '参数',
            children: (
              <pre style={{
                fontSize: 11, fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                background: 'var(--color-surface-2)', padding: 8, borderRadius: 4,
                whiteSpace: 'pre-wrap', margin: 0, maxHeight: 200, overflow: 'auto',
              }}>
                {JSON.stringify(tool.params ?? {}, null, 2)}
              </pre>
            ),
          },
          {
            key: 'result',
            label: isError ? '❌ 错误' : '结果',
            children: tool.status === 'executing' ? (
              <div style={{ color: 'var(--color-text-tertiary)', fontStyle: 'italic', padding: 8 }}>
                等待执行结果…
              </div>
            ) : resultStr ? (
              <div>
                <pre style={{
                  fontSize: 11, fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                  background: 'var(--color-surface-2)', padding: 8, borderRadius: 4,
                  whiteSpace: 'pre-wrap', margin: 0,
                  maxHeight: resultExpanded ? 'none' : 150, overflow: 'hidden',
                }}>
                  {isError && <span style={{ color: 'var(--color-danger)' }}>{resultStr}</span>}
                  {!isError && resultStr}
                </pre>
                {resultStr.length > 500 && !resultExpanded && (
                  <Button type="link" size="small" onClick={() => setResultExpanded(true)}>
                    展开全部
                  </Button>
                )}
              </div>
            ) : (
              <div style={{ color: 'var(--color-text-tertiary)', fontStyle: 'italic', padding: 8 }}>
                无结果
              </div>
            ),
          },
        ]}
      />
    ),
  }];

  return (
    <Collapse
      activeKey={open ? ['1'] : []}
      onChange={(keys) => setOpen(keys.includes('1'))}
      items={items}
      bordered
      expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
      size="small"
      style={{
        borderRadius: 6,
        border: `1px solid ${isError ? 'var(--color-danger)' : isExecuting ? 'var(--color-info)' : 'var(--color-border)'}`,
        marginBottom: 0,
      }}
    />
  );
};

export default ToolCallBlock;
