import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table, Tag, Button, Space, Select, Typography, Modal, Tabs, Empty,
  message, Popconfirm, Tooltip,
} from 'antd';
import {
  ReloadOutlined, BranchesOutlined, ArchiveOutlined,
  DeleteOutlined, EyeOutlined, FormOutlined,
} from '@ant-design/icons';
import { sessionsApi } from '../api/sessions';
import { agentsApi } from '../api/agents';
import dayjs from 'dayjs';

const { Title } = Typography;

const STATUS_OPTIONS = [
  { label: '全部', value: '' },
  { label: '活跃', value: 'active' },
  { label: '已归档', value: 'archived' },
  { label: '已删除', value: 'deleted' },
];

const STATUS_MAP: Record<string, { color: string; text: string }> = {
  active: { color: 'green', text: '活跃' },
  archived: { color: 'default', text: '已归档' },
  deleted: { color: 'red', text: '已删除' },
};

/** Token 格式化 */
function fmtTokens(n: number): string {
  if (!n) return '-';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}

const History: React.FC = () => {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [agentFilter, setAgentFilter] = useState('');
  const [agents, setAgents] = useState<any[]>([]);

  // detail modal
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // operation loading
  const [opLoading, setOpLoading] = useState<string | null>(null);

  useEffect(() => {
    agentsApi.getAgents({ per_page: 200 }).then((res) => {
      setAgents(res.data?.items ?? []);
    }).catch(() => {});
  }, []);

  const load = useCallback(async (p: number, status: string, agent: string) => {
    setLoading(true);
    try {
      const params: any = { page: p, per_page: 20 };
      if (status) params.status = status;
      if (agent) params.agent_id = agent;
      const res = await sessionsApi.getSessions(params);
      setSessions(res.data?.items ?? []);
      setTotal(res.data?.total ?? 0);
    } catch {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(page, statusFilter, agentFilter); }, [page, statusFilter, agentFilter, load]);

  const doOp = async (id: string, op: () => Promise<any>, label: string) => {
    setOpLoading(id);
    try {
      const res = await op();
      message.success(label + '成功');
      // resume/fork return new session -> navigate
      if (res?.data?.session?.id && (label === '续聊' || label === '分叉')) {
        navigate(`/chat/${res.data.session.id}`);
        return;
      }
      load(page, statusFilter, agentFilter);
    } catch (err: any) {
      message.error(err?.response?.data?.message || label + '失败');
    } finally {
      setOpLoading(null);
    }
  };

  const showDetail = async (id: string) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const res = await sessionsApi.getDetail(id);
      setDetailData(res.data);
    } catch {
      message.error('加载详情失败');
    } finally {
      setDetailLoading(false);
    }
  };

  const columns = [
    {
      title: '时间',
      dataIndex: 'created_at',
      width: 150,
      render: (v: string) => dayjs(v).format('MM-DD HH:mm'),
    },
    { title: 'Agent', dataIndex: 'agent_name', width: 140, ellipsis: true },
    {
      title: '消息数',
      dataIndex: 'message_count',
      width: 80,
      align: 'center' as const,
    },
    {
      title: 'Token',
      dataIndex: 'last_usage',
      width: 90,
      align: 'center' as const,
      render: (v: any) => v?.output ? fmtTokens(v.output) : '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (v: string) => {
        const m = STATUS_MAP[v] ?? { color: 'default', text: v };
        return <Tag color={m.color}>{m.text}</Tag>;
      },
    },
    {
      title: '操作',
      width: 260,
      render: (_: any, record: any) => (
        <Space size={2} wrap>
          {record.status === 'active' && (
            <>
              <Button
                type="link" size="small"
                loading={opLoading === record.id}
                onClick={() => doOp(record.id, () => sessionsApi.resumeSession(record.id), '续聊')}
              >
                续聊
              </Button>
              <Button
                type="link" size="small"
                loading={opLoading === record.id}
                onClick={() => doOp(record.id, () => sessionsApi.forkSession(record.id), '分叉')}
              >
                分叉
              </Button>
              <Button
                type="link" size="small"
                loading={opLoading === record.id}
                onClick={() => doOp(record.id, () => sessionsApi.archiveSession(record.id), '归档')}
              >
                归档
              </Button>
            </>
          )}
          <Button type="link" size="small" onClick={() => showDetail(record.id)}>
            查看
          </Button>
          <Popconfirm
            title="确定删除？"
            onConfirm={() => doOp(record.id, () => sessionsApi.deleteSession(record.id), '删除')}
            okButtonProps={{ danger: true }}
          >
            <Button type="link" size="small" danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>会话</Title>

      {/* ── 筛选栏 ── */}
      <Space style={{ marginBottom: 16 }} wrap>
        <Select
          value={statusFilter}
          onChange={(v) => { setStatusFilter(v); setPage(1); }}
          options={STATUS_OPTIONS}
          style={{ width: 120 }}
          placeholder="状态"
        />
        <Select
          value={agentFilter}
          onChange={(v) => { setAgentFilter(v); setPage(1); }}
          allowClear
          placeholder="全部 Agent"
          style={{ width: 200 }}
          options={agents.map((a) => ({ label: a.name, value: a.id }))}
        />
        <Button icon={<ReloadOutlined />} onClick={() => load(page, statusFilter, agentFilter)}>
          刷新
        </Button>
      </Space>

      {!loading && total === 0 ? (
        <Empty description="暂无会话记录" />
      ) : (
        <Table
          rowKey="id"
          columns={columns}
          dataSource={sessions}
          loading={loading}
          pagination={{
            current: page,
            total,
            pageSize: 20,
            showTotal: (t) => `共 ${t} 条`,
            onChange: setPage,
          }}
        />
      )}

      {/* ── 详情 Modal ── */}
      <Modal
        title="会话详情"
        open={detailOpen}
        onCancel={() => { setDetailOpen(false); setDetailData(null); }}
        footer={null}
        width={720}
      >
        {detailLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>加载中...</div>
        ) : detailData ? (
          <Tabs
            items={[
              {
                key: 'messages',
                label: `消息 (${detailData.messages?.length ?? 0})`,
                children: (
                  <div style={{ maxHeight: 400, overflow: 'auto' }}>
                    {detailData.messages?.length === 0 ? (
                      <Empty description="暂无消息" />
                    ) : (
                      detailData.messages?.map((m: any) => (
                        <div
                          key={m.id}
                          style={{
                            marginBottom: 12,
                            padding: 12,
                            borderRadius: 8,
                            background: m.role === 'user' ? 'var(--color-primary-subtle)' : 'var(--color-surface-2)',
                          }}
                        >
                          <Tag color={m.role === 'user' ? 'blue' : m.role === 'assistant' ? 'green' : 'default'}>
                            {m.role}
                          </Tag>
                          <div style={{ whiteSpace: 'pre-wrap', marginTop: 4 }}>
                            {m.content || '(无内容)'}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ),
              },
              {
                key: 'events',
                label: `事件 (${detailData.events?.length ?? 0})`,
                children: (
                  <div style={{ maxHeight: 400, overflow: 'auto' }}>
                    {detailData.events?.length === 0 ? (
                      <Empty description="暂无事件" />
                    ) : (
                      detailData.events?.map((e: any) => (
                        <div key={e.id} style={{ marginBottom: 8, padding: 8, borderRadius: 6, background: 'var(--color-surface-2)' }}>
                          <Space>
                            <Tag>{e.event_type}</Tag>
                            <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                              seq: {e.seq}
                            </span>
                          </Space>
                          <pre style={{ fontSize: 12, marginTop: 4, whiteSpace: 'pre-wrap' }}>
                            {JSON.stringify(e.payload, null, 2)}
                          </pre>
                        </div>
                      ))
                    )}
                  </div>
                ),
              },
            ]}
          />
        ) : null}
      </Modal>
    </div>
  );
};

export default History;
