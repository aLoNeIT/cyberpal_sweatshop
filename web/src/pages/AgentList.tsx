import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table, Button, Tag, Space, Modal, Form, Input, Select, Typography, Empty,
  message, Popconfirm,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { agentsApi } from '../api/agents';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const MODEL_OPTIONS = [
  { label: 'gpt-5.6-sol', value: 'gpt-5.6-sol' },
  { label: 'gpt-5.6-terra', value: 'gpt-5.6-terra' },
  { label: 'gpt-5.6-luna', value: 'gpt-5.6-luna' },
  { label: 'gpt-4o', value: 'gpt-4o' },
];

const THINKING_OPTIONS = [
  { label: 'off', value: 'off' },
  { label: 'minimal', value: 'minimal' },
  { label: 'low', value: 'low' },
  { label: 'medium', value: 'medium' },
  { label: 'high', value: 'high' },
  { label: 'max', value: 'max' },
];

const STATUS_MAP: Record<string, { color: string; text: string }> = {
  online: { color: 'green', text: '在线' },
  offline: { color: 'default', text: '离线' },
  error: { color: 'red', text: '异常' },
};

const AgentList: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [agents, setAgents] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await agentsApi.getAgents({ page: p, per_page: 20 });
      setAgents(res.data?.items ?? []);
      setTotal(res.data?.total ?? 0);
    } catch {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(page); }, [page, load]);

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      setCreating(true);
      const res = await agentsApi.createAgent(values);
      message.success('Agent 创建成功');
      setModalOpen(false);
      form.resetFields();
      navigate(`/agents/${res.data.agent.id}`);
    } catch (err: any) {
      if (err?.errorFields) return; // form validation
      message.error(err?.response?.data?.message || '创建失败');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await agentsApi.deleteAgent(id);
      message.success('已删除');
      load(page);
    } catch {
      message.error('删除失败');
    }
  };

  const columns = [
    { title: '名称', dataIndex: 'name', ellipsis: true },
    { title: '模型', dataIndex: 'model', width: 150 },
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
      title: '更新时间',
      dataIndex: 'updated_at',
      width: 160,
      render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      width: 160,
      render: (_: any, record: any) => (
        <Space size={4}>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/agents/${record.id}`)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除此 Agent？"
            description="删除后将同时清空关联的 skill / MCP / 运行时目录"
            onConfirm={() => handleDelete(record.id)}
            okText="删除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>我的 Agent</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
          新建 Agent
        </Button>
      </div>

      {!loading && total === 0 ? (
        <Empty description="还没有 Agent">
          <Button type="primary" onClick={() => setModalOpen(true)}>
            创建第一个 Agent
          </Button>
        </Empty>
      ) : (
        <Table
          rowKey="id"
          columns={columns}
          dataSource={agents}
          loading={loading}
          pagination={{
            current: page,
            total,
            pageSize: 20,
            showTotal: (t) => `共 ${t} 个`,
            onChange: setPage,
          }}
          onRow={(record) => ({
            style: { cursor: 'pointer' },
            onClick: () => navigate(`/agents/${record.id}`),
          })}
        />
      )}

      {/* ── 新建 Agent Modal ── */}
      <Modal
        title="新建 Agent"
        open={modalOpen}
        onOk={handleCreate}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        confirmLoading={creating}
        okText="创建"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label="名称"
            rules={[{ required: true, message: '请输入 Agent 名称' }]}
          >
            <Input placeholder="例如：代码审查助手" maxLength={128} />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea placeholder="简短描述 Agent 的用途" rows={2} maxLength={512} />
          </Form.Item>
          <Form.Item
            name="model"
            label="模型"
            initialValue="gpt-5.6-luna"
            rules={[{ required: true }]}
          >
            <Select options={MODEL_OPTIONS} />
          </Form.Item>
          <Form.Item name="thinking" label="思考深度" initialValue="medium">
            <Select options={THINKING_OPTIONS} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AgentList;
