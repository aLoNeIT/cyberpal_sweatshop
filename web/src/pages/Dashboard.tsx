import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Statistic, Table, Tag, Button, Skeleton, Empty, Typography, message, Space } from 'antd';
import {
  RobotOutlined,
  MessageOutlined,
  ThunderboltOutlined,
  DollarOutlined,
  ArrowRightOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { agentsApi } from '../api/agents';
import { sessionsApi } from '../api/sessions';
import { billingApi } from '../api/billing';
import dayjs from 'dayjs';

const { Title } = Typography;

/** Token 格式化：>=1000 → "12.5k" */
function fmtTokens(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}

/** 费用格式化 */
function fmtCost(n: number): string {
  return '¥' + n.toFixed(2);
}

/** 状态 Badge 映射 */
const statusBadge: Record<string, { color: string; text: string }> = {
  active: { color: 'green', text: '活跃' },
  archived: { color: 'default', text: '已归档' },
  deleted: { color: 'red', text: '已删除' },
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const [agentsTotal, setAgentsTotal] = useState(0);
  const [sessionsTotal, setSessionsTotal] = useState(0);
  const [billingInput, setBillingInput] = useState(0);
  const [billingCost, setBillingCost] = useState(0);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoadingCards(true);
    setLoadingSessions(true);
    try {
      const [agentsRes, sessionsRes, billingRes] = await Promise.all([
        agentsApi.getAgents({ per_page: 1 }),
        sessionsApi.getSessions({ per_page: 5 }),
        billingApi.getSummary(),
      ]);
      setAgentsTotal(agentsRes.data?.total ?? 0);
      setSessionsTotal(sessionsRes.data?.total ?? 0);
      setBillingInput(billingRes.data?.input_tokens ?? 0);
      setBillingCost(billingRes.data?.cost_estimate_usd ?? 0);
      setRecentSessions(sessionsRes.data?.items ?? []);
    } catch {
      message.error('加载失败');
    } finally {
      setLoadingCards(false);
      setLoadingSessions(false);
    }
  }

  const columns = [
    {
      title: '时间',
      dataIndex: 'created_at',
      width: 160,
      render: (v: string) => dayjs(v).format('MM-DD HH:mm'),
    },
    { title: 'Agent', dataIndex: 'agent_name', ellipsis: true },
    {
      title: '消息数',
      dataIndex: 'message_count',
      width: 80,
      align: 'center' as const,
    },
    {
      title: 'Token',
      dataIndex: 'last_usage',
      width: 100,
      align: 'center' as const,
      render: (v: any) => {
        if (v?.output) return fmtTokens(v.output);
        return '-';
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (v: string) => {
        const b = statusBadge[v] ?? { color: 'default', text: v };
        return <Tag color={b.color}>{b.text}</Tag>;
      },
    },
    {
      title: '操作',
      width: 160,
      render: (_: any, record: any) => (
        <Space size={4}>
          <Button
            type="link"
            size="small"
            onClick={() => navigate(`/chat/${record.id}`)}
          >
            续聊
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => navigate(`/sessions`)}
          >
            明细
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>概览</Title>

      {/* ── 指标卡 ── */}
      {loadingCards ? (
        <Skeleton active paragraph={{ rows: 1 }} />
      ) : (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={12} sm={6}>
            <Card bordered>
              <Statistic
                title="Agent 数"
                value={agentsTotal}
                prefix={<RobotOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card bordered>
              <Statistic
                title="会话数"
                value={sessionsTotal}
                prefix={<MessageOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card bordered>
              <Statistic
                title="本月 Token"
                value={fmtTokens(billingInput)}
                prefix={<ThunderboltOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card bordered>
              <Statistic
                title="本月费用"
                value={fmtCost(billingCost)}
                prefix={<DollarOutlined />}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* ── 最近会话 ── */}
      <Card
        title="最近会话"
        extra={
          <Button type="link" onClick={() => navigate('/sessions')}>
            查看全部 <ArrowRightOutlined />
          </Button>
        }
        style={{ borderRadius: 'var(--radius-lg)' }}
      >
        {agentsTotal === 0 ? (
          <Empty description="还没有 Agent">
            <Button type="primary" onClick={() => navigate('/agents')}>
              创建第一个 Agent
            </Button>
          </Empty>
        ) : sessionsTotal === 0 ? (
          <Empty description="还没有会话，选择一个 Agent 开始对话" />
        ) : (
          <Table
            rowKey="id"
            columns={columns}
            dataSource={recentSessions}
            loading={loadingSessions}
            pagination={false}
            size="middle"
            onRow={(record) => ({
              style: { cursor: 'pointer' },
              onClick: () => navigate(`/chat/${record.id}`),
            })}
          />
        )}
      </Card>
    </div>
  );
};

export default Dashboard;
