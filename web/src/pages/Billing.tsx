import React, { useEffect, useState, useCallback } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Select, Typography, Empty, Skeleton, message } from 'antd';
import { ThunderboltOutlined, DollarOutlined, FileTextOutlined } from '@ant-design/icons';
import { billingApi } from '../api/billing';
import dayjs from 'dayjs';

const { Title } = Typography;

const PERIOD_OPTIONS = [
  { label: '本月', value: 'current_month' },
  { label: '上月', value: 'last_month' },
  { label: '近 3 月', value: 'last_3' },
];

/** Token 格式化 */
function fmtTokens(n: number): string {
  if (!n) return '0';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}

const Billing: React.FC = () => {
  const [period, setPeriod] = useState('current_month');
  const [summary, setSummary] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(true);

  const loadSummary = useCallback(async (p: string) => {
    setLoadingSummary(true);
    try {
      const res = await billingApi.getSummary(p);
      setSummary(res.data);
      setPage(1);
    } catch {
      message.error('加载汇总失败');
    } finally {
      setLoadingSummary(false);
    }
  }, []);

  const loadRecords = useCallback(async (pg: number) => {
    setLoadingRecords(true);
    try {
      const params: any = { page: pg, per_page: 20 };
      // compute from/to from period
      const now = dayjs();
      if (period === 'current_month') {
        params.from = now.startOf('month').format('YYYY-MM-DD HH:mm:ss');
        params.to = now.endOf('month').format('YYYY-MM-DD HH:mm:ss');
      } else if (period === 'last_month') {
        const lm = now.subtract(1, 'month');
        params.from = lm.startOf('month').format('YYYY-MM-DD HH:mm:ss');
        params.to = lm.endOf('month').format('YYYY-MM-DD HH:mm:ss');
      } else if (period === 'last_3') {
        params.from = now.subtract(3, 'month').startOf('month').format('YYYY-MM-DD HH:mm:ss');
        params.to = now.format('YYYY-MM-DD HH:mm:ss');
      }
      const res = await billingApi.getRecords(params);
      setRecords(res.data?.items ?? []);
      setTotal(res.data?.total ?? 0);
    } catch {
      message.error('加载明细失败');
    } finally {
      setLoadingRecords(false);
    }
  }, [period]);

  useEffect(() => { loadSummary(period); }, [period, loadSummary]);
  useEffect(() => { loadRecords(page); }, [page, period, loadRecords]);

  const columns = [
    {
      title: '时间',
      dataIndex: 'created_at',
      width: 160,
      render: (v: string) => dayjs(v).format('MM-DD HH:mm'),
    },
    {
      title: '会话',
      dataIndex: 'session_id',
      width: 120,
      ellipsis: true,
      render: (v: string) => v?.substring(0, 8) + '...',
    },
    { title: '模型', dataIndex: 'model', width: 130 },
    {
      title: 'Input',
      dataIndex: 'input_tokens',
      width: 80,
      align: 'center' as const,
      render: (v: number) => fmtTokens(v),
    },
    {
      title: 'Output',
      dataIndex: 'output_tokens',
      width: 80,
      align: 'center' as const,
      render: (v: number) => fmtTokens(v),
    },
    {
      title: 'Cache',
      dataIndex: 'cache_read_tokens',
      width: 80,
      align: 'center' as const,
      render: (v: number) => fmtTokens(v),
    },
    {
      title: '费用',
      dataIndex: 'cost_estimate',
      width: 90,
      align: 'right' as const,
      render: (v: number) => '¥' + (v ?? 0).toFixed(4),
    },
    {
      title: '来源',
      dataIndex: 'source',
      width: 80,
      render: (v: string) => (
        <Tag color={v === 'usage' ? 'blue' : v === 'estimate' ? 'orange' : 'default'}>
          {v === 'usage' ? '精确' : v === 'estimate' ? '估算' : v}
        </Tag>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>消费明细</Title>
        <Select
          value={period}
          onChange={setPeriod}
          options={PERIOD_OPTIONS}
          style={{ width: 140 }}
        />
      </div>

      {/* ── 汇总卡 ── */}
      {loadingSummary ? (
        <Skeleton active paragraph={{ rows: 1 }} style={{ marginBottom: 24 }} />
      ) : summary ? (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={12} sm={4}>
            <Card bordered>
              <Statistic title="Input" value={fmtTokens(summary.input_tokens)} prefix={<ThunderboltOutlined />} />
            </Card>
          </Col>
          <Col xs={12} sm={4}>
            <Card bordered>
              <Statistic title="Output" value={fmtTokens(summary.output_tokens)} />
            </Card>
          </Col>
          <Col xs={12} sm={4}>
            <Card bordered>
              <Statistic title="Cache Read" value={fmtTokens(summary.cache_read_tokens)} />
            </Card>
          </Col>
          <Col xs={12} sm={4}>
            <Card bordered>
              <Statistic title="Cache Write" value={fmtTokens(summary.cache_write_tokens)} />
            </Card>
          </Col>
          <Col xs={12} sm={4}>
            <Card bordered>
              <Statistic
                title="估算费用"
                value={'¥' + (summary.cost_estimate_usd ?? 0).toFixed(2)}
                prefix={<DollarOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={4}>
            <Card bordered>
              <Statistic title="模型数" value={summary.by_model?.length ?? 0} prefix={<FileTextOutlined />} />
            </Card>
          </Col>
        </Row>
      ) : null}

      {/* ── 明细表格 ── */}
      {!loadingRecords && total === 0 ? (
        <Empty description="暂无消费记录" />
      ) : (
        <Table
          rowKey="id"
          columns={columns}
          dataSource={records}
          loading={loadingRecords}
          pagination={{
            current: page,
            total,
            pageSize: 20,
            showTotal: (t) => `共 ${t} 条`,
            onChange: setPage,
          }}
          scroll={{ x: 800 }}
        />
      )}
    </div>
  );
};

export default Billing;
