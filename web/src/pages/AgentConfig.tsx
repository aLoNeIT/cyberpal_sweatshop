import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Form, Input, Select, Button, Space, Typography, Row, Col, Divider,
  Checkbox, Table, Modal, Popconfirm, Tag, Spin, Empty, message, Tooltip,
} from 'antd';
import { ArrowLeftOutlined, PlusOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined, SaveOutlined } from '@ant-design/icons';
import { agentsApi } from '../api/agents';
import { skillsApi } from '../api/skills';
import { mcpApi } from '../api/mcp';
import { sessionsApi } from '../api/sessions';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

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

const TRANSPORT_OPTIONS = [
  { label: 'stdio', value: 'stdio' },
  { label: 'http', value: 'http' },
  { label: 'sse', value: 'sse' },
];

const AgentConfig: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [mcpForm] = Form.useForm();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [agent, setAgent] = useState<any>(null);

  // skills
  const [allSkills, setAllSkills] = useState<any[]>([]);
  const [mountedSkillIds, setMountedSkillIds] = useState<string[]>([]);

  // mcp
  const [mcpItems, setMcpItems] = useState<any[]>([]);
  const [mcpModalOpen, setMcpModalOpen] = useState(false);
  const [editingMcp, setEditingMcp] = useState<any>(null);
  const [mcpSaving, setMcpSaving] = useState(false);

  // ── Load agent ──
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      agentsApi.getAgent(id),
      skillsApi.getSkills({ per_page: 200 }),
      skillsApi.getAgentSkills(id),
      mcpApi.getMcp(id),
    ])
      .then(([agentRes, skillsRes, mountedRes, mcpRes]) => {
        const a = agentRes.data.agent;
        setAgent(a);
        form.setFieldsValue(a);
        setAllSkills(skillsRes.data?.items ?? []);
        setMountedSkillIds((mountedRes.data?.skills ?? []).map((s: any) => s.id));
        setMcpItems(mcpRes.data?.items ?? []);
      })
      .catch(() => message.error('加载 Agent 失败'))
      .finally(() => setLoading(false));
  }, [id]);

  // ── Save ──
  const handleSave = async () => {
    if (!id) return;
    try {
      const values = await form.validateFields();
      setSaving(true);
      await agentsApi.updateAgent(id, values);
      message.success('保存成功');
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err?.response?.data?.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  // ── Launch ──
  const handleLaunch = async () => {
    if (!id) return;
    setLaunching(true);
    try {
      const res = await sessionsApi.createSession(id, agent?.name ?? '');
      message.success('会话已创建');
      navigate(`/chat/${res.data.session.id}`);
    } catch (err: any) {
      message.error(err?.response?.data?.message || '启动失败');
    } finally {
      setLaunching(false);
    }
  };

  // ── Skills ──
  const handleSkillChange = useCallback(async (checkedIds: string[]) => {
    setMountedSkillIds(checkedIds);
    try {
      await skillsApi.mountSkills(id!, checkedIds);
    } catch {
      message.error('Skill 挂载失败');
    }
  }, [id]);

  // ── MCP ──
  const openMcpCreate = () => {
    setEditingMcp(null);
    mcpForm.resetFields();
    mcpForm.setFieldsValue({ transport: 'stdio', enabled: 1 });
    setMcpModalOpen(true);
  };
  const openMcpEdit = (item: any) => {
    setEditingMcp(item);
    mcpForm.setFieldsValue(item);
    setMcpModalOpen(true);
  };
  const handleMcpSave = async () => {
    try {
      const values = await mcpForm.validateFields();
      // parse args lines / env lines / headers json
      const payload: any = { ...values };
      if (values._args) {
        payload.args_json = values._args.split('\n').filter(Boolean).map((s: string) => s.trim());
      }
      if (values._env) {
        const env: Record<string, string> = {};
        values._env.split('\n').filter(Boolean).forEach((line: string) => {
          const idx = line.indexOf('=');
          if (idx > 0) env[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
        });
        payload.env_json = Object.keys(env).length > 0 ? env : undefined;
      }
      if (values._headers) {
        try { payload.headers_json = JSON.parse(values._headers); } catch { message.error('Headers 格式不是有效 JSON'); return; }
      }
      delete payload._args; delete payload._env; delete payload._headers;

      setMcpSaving(true);
      if (editingMcp) {
        await mcpApi.updateMcp(id!, editingMcp.id, payload);
      } else {
        await mcpApi.createMcp(id!, payload);
      }
      // refresh
      const res = await mcpApi.getMcp(id!);
      setMcpItems(res.data?.items ?? []);
      setMcpModalOpen(false);
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error('保存失败');
    } finally {
      setMcpSaving(false);
    }
  };
  const handleMcpDelete = async (mid: string) => {
    try {
      await mcpApi.deleteMcp(id!, mid);
      const res = await mcpApi.getMcp(id!);
      setMcpItems(res.data?.items ?? []);
      message.success('MCP 已删除');
    } catch { message.error('删除失败'); }
  };

  // ── Command preview ──
  const previewCmd = useMemo(() => {
    const vals = form.getFieldsValue();
    const parts = ['pi', '--mode', 'rpc'];
    if (vals.provider) parts.push('--provider', vals.provider);
    if (vals.model) parts.push('--model', vals.model);
    if (vals.thinking && vals.thinking !== 'medium') parts.push('--thinking', vals.thinking);
    parts.push('--profile', `tenant_{user_id}`);
    if (vals.system_prompt) parts.push('--system-prompt', `"${vals.system_prompt.slice(0, 40)}…"`);
    if (vals.append_system_prompt) parts.push('--append-system-prompt', `"${vals.append_system_prompt.slice(0, 40)}…"`);
    // skills
    const selected = allSkills.filter((s) => mountedSkillIds.includes(s.id));
    selected.forEach((s) => parts.push('--skill', s.path ?? s.name));
    if (vals.tools_whitelist) parts.push('--tools', vals.tools_whitelist);
    if (vals.tools_blacklist) parts.push('--exclude-tools', vals.tools_blacklist);
    return parts.join(' ');
  }, [form.getFieldsValue(), mountedSkillIds, allSkills]);

  const mcpColumns = [
    { title: '名称', dataIndex: 'name', width: 140 },
    { title: '传输', dataIndex: 'transport', width: 70, render: (v: string) => <Tag>{v}</Tag> },
    {
      title: '操作', width: 140,
      render: (_: any, r: any) => (
        <Space size={2}>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openMcpEdit(r)}>编辑</Button>
          <Popconfirm title="删除此 MCP？" onConfirm={() => handleMcpDelete(r.id)} okButtonProps={{ danger: true }}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;

  return (
    <div>
      {/* ── Head bar ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Space>
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/agents')}>返回列表</Button>
          <Title level={4} style={{ margin: 0 }}>{agent?.name ?? 'Agent 配置'}</Title>
        </Space>
        <Space>
          <Button icon={<SaveOutlined />} loading={saving} onClick={handleSave} type="primary">保存</Button>
          <Button icon={<PlayCircleOutlined />} loading={launching} onClick={handleLaunch}>启动聊天</Button>
        </Space>
      </div>

      <Row gutter={24}>
        {/* ── LEFT: Basic + Model + Tools ── */}
        <Col xs={24} lg={12}>
          <Form form={form} layout="vertical">
            <Card title="基础配置" size="small" style={{ marginBottom: 16, borderRadius: 'var(--radius-lg)' }}>
              <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入名称' }]}>
                <Input maxLength={128} />
              </Form.Item>
              <Form.Item name="description" label="描述">
                <TextArea rows={2} maxLength={512} />
              </Form.Item>
              <Form.Item name="system_prompt" label="System Prompt">
                <TextArea rows={6} style={{ fontFamily: 'var(--font-mono)' }} placeholder="系统提示词…" />
              </Form.Item>
              <Form.Item name="append_system_prompt" label="Append Prompt">
                <TextArea rows={3} style={{ fontFamily: 'var(--font-mono)' }} placeholder="追加提示词…" />
              </Form.Item>
            </Card>

            <Card title="模型配置" size="small" style={{ marginBottom: 16, borderRadius: 'var(--radius-lg)' }}>
              <Form.Item name="model" label="模型" rules={[{ required: true }]}>
                <Select options={MODEL_OPTIONS} />
              </Form.Item>
              <Form.Item name="provider" label="Provider" initialValue="openai">
                <Select options={[{ label: 'openai', value: 'openai' }]} />
              </Form.Item>
              <Form.Item name="thinking" label="思考深度" initialValue="medium">
                <Select options={THINKING_OPTIONS} />
              </Form.Item>
            </Card>

            <Card title="工具权限" size="small" style={{ borderRadius: 'var(--radius-lg)' }}>
              <Form.Item name="tools_whitelist" label="白名单（逗号分隔）" tooltip="留空 = 全部可用">
                <Input placeholder="例如: bash, read" />
              </Form.Item>
              <Form.Item name="tools_blacklist" label="黑名单（逗号分隔）" tooltip="禁止使用的工具">
                <Input placeholder="例如: bash" />
              </Form.Item>
            </Card>
          </Form>
        </Col>

        {/* ── RIGHT: Skills + MCP + Preview ── */}
        <Col xs={24} lg={12}>
          {/* Skills */}
          <Card title="Skill 挂载" size="small" style={{ marginBottom: 16, borderRadius: 'var(--radius-lg)' }}>
            {allSkills.length === 0 ? (
              <Empty description="暂无可用 Skill" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <Checkbox.Group value={mountedSkillIds} onChange={handleSkillChange}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {allSkills.map((s) => (
                    <Checkbox key={s.id} value={s.id}>
                      <Text strong>{s.name}</Text>
                      {s.description && <Text type="secondary" style={{ marginLeft: 8 }}>{s.description}</Text>}
                    </Checkbox>
                  ))}
                </div>
              </Checkbox.Group>
            )}
          </Card>

          {/* MCP */}
          <Card
            title="MCP 配置"
            size="small"
            extra={<Button type="link" icon={<PlusOutlined />} onClick={openMcpCreate}>新增 MCP</Button>}
            style={{ marginBottom: 16, borderRadius: 'var(--radius-lg)' }}
          >
            {mcpItems.length === 0 ? (
              <Empty description="暂无 MCP 配置" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <Table rowKey="id" columns={mcpColumns} dataSource={mcpItems} pagination={false} size="small" />
            )}
          </Card>

          {/* Preview */}
          <Card title="启动参数预览" size="small" style={{ borderRadius: 'var(--radius-lg)' }}>
            <pre style={{
              fontSize: 12, fontFamily: '"JetBrains Mono", "Fira Code", monospace',
              background: 'var(--color-surface-2)', padding: 12, borderRadius: 6,
              whiteSpace: 'pre-wrap', wordBreak: 'break-all', margin: 0,
              maxHeight: 200, overflow: 'auto',
            }}>
              {previewCmd}
            </pre>
          </Card>
        </Col>
      </Row>

      {/* ── MCP Modal ── */}
      <Modal
        title={editingMcp ? '编辑 MCP' : '新增 MCP'}
        open={mcpModalOpen}
        onOk={handleMcpSave}
        onCancel={() => setMcpModalOpen(false)}
        confirmLoading={mcpSaving}
        okText="保存"
        width={520}
      >
        <Form form={mcpForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}>
            <Input placeholder="例如: filesystem" />
          </Form.Item>
          <Form.Item name="transport" label="传输方式" rules={[{ required: true }]}>
            <Select options={TRANSPORT_OPTIONS} />
          </Form.Item>
          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.transport !== cur.transport}>
            {({ getFieldValue }) => {
              const t = getFieldValue('transport');
              if (t === 'stdio') return (
                <>
                  <Form.Item name="command" label="命令"><Input placeholder="例如: npx" /></Form.Item>
                  <Form.Item name="_args" label="参数（每行一个）">
                    <TextArea rows={3} placeholder={`-y\n@modelcontextprotocol/server-filesystem`} />
                  </Form.Item>
                  <Form.Item name="_env" label="环境变量（每行 KEY=VALUE）">
                    <TextArea rows={2} placeholder="API_KEY=xxx" />
                  </Form.Item>
                </>
              );
              return (
                <>
                  <Form.Item name="url" label="URL" rules={[{ required: true }]}>
                    <Input placeholder="https://..." />
                  </Form.Item>
                  <Form.Item name="_headers" label="Headers (JSON)">
                    <TextArea rows={3} placeholder='{"Authorization": "Bearer xxx"}' />
                  </Form.Item>
                </>
              );
            }}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AgentConfig;
