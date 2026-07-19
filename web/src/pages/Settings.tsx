import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Button, Select, Switch, Radio, Typography, Row, Col, message, Spin } from 'antd';
import { profileApi } from '../api/profile';
import { useThemeContext } from '../theme/ThemeProvider';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const ARCHIVE_DAY_OPTIONS = [
  { label: '7 天', value: 7 },
  { label: '14 天', value: 14 },
  { label: '30 天', value: 30 },
  { label: '60 天', value: 60 },
  { label: '90 天', value: 90 },
];

const Settings: React.FC = () => {
  const { mode, toggle } = useThemeContext();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingArchive, setSavingArchive] = useState(false);

  // 表单本地状态（非受控→受控的桥）
  const [displayName, setDisplayName] = useState('');
  const [archiveEnabled, setArchiveEnabled] = useState(true);
  const [archiveDays, setArchiveDays] = useState(30);

  useEffect(() => {
    setLoading(true);
    profileApi
      .getProfile()
      .then((res) => {
        const u = res.data?.user ?? {};
        setProfile(u);
        setDisplayName(u.display_name ?? '');
        setArchiveEnabled(u.auto_archive_enabled ?? true);
        setArchiveDays(u.auto_archive_days ?? 30);
      })
      .catch(() => message.error('加载个人资料失败'))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await profileApi.updateProfile({ display_name: displayName });
      message.success('个人资料已保存');
    } catch (err: any) {
      message.error(err?.response?.data?.message || '保存失败');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveArchive = async () => {
    setSavingArchive(true);
    try {
      await profileApi.updateProfile({
        auto_archive_enabled: archiveEnabled,
        auto_archive_days: archiveDays,
      });
      message.success('归档设置已保存');
    } catch (err: any) {
      message.error(err?.response?.data?.message || '保存失败');
    } finally {
      setSavingArchive(false);
    }
  };

  const handleThemeChange = async (e: any) => {
    const newMode = e.target.value;
    if (newMode !== mode) {
      toggle();
      // 同步保存到后端
      try {
        await profileApi.updateProfile({ theme_pref: newMode });
      } catch { /* 静默 */ }
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <Title level={4} style={{ marginBottom: 24 }}>设置</Title>

      {/* ── 个人资料 ── */}
      <Card title="个人资料" style={{ borderRadius: 'var(--radius-lg)', marginBottom: 24 }}>
        <Form layout="vertical">
          <Form.Item label="邮箱">
            <Input value={profile?.email ?? ''} disabled />
          </Form.Item>
          <Form.Item label="昵称">
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="输入昵称"
              maxLength={64}
            />
          </Form.Item>
          <Form.Item label="注册时间">
            <Text type="secondary">
              {profile?.created_at ? dayjs(profile.created_at).format('YYYY-MM-DD') : '-'}
            </Text>
          </Form.Item>
          <Button type="primary" loading={savingProfile} onClick={handleSaveProfile}>
            保存
          </Button>
        </Form>
      </Card>

      {/* ── 主题设置 ── */}
      <Card title="主题设置" style={{ borderRadius: 'var(--radius-lg)', marginBottom: 24 }}>
        <Radio.Group value={mode} onChange={handleThemeChange}>
          <Radio.Button value="light">☀️ 浅色</Radio.Button>
          <Radio.Button value="dark">🌙 深色</Radio.Button>
        </Radio.Group>
        <div style={{ marginTop: 8 }}>
          <Text type="secondary">选择「深色」后将自动切换为深色主题</Text>
        </div>
      </Card>

      {/* ── 归档设置 ── */}
      <Card title="归档设置" style={{ borderRadius: 'var(--radius-lg)' }}>
        <Form layout="vertical">
          <Row gutter={24}>
            <Col xs={24} sm={12}>
              <Form.Item label="自动归档">
                <Switch
                  checked={archiveEnabled}
                  onChange={setArchiveEnabled}
                />
                <Text type="secondary" style={{ marginLeft: 12 }}>
                  开启后，长时间不活动的会话将自动归档
                </Text>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="归档天数">
                <Select
                  value={archiveDays}
                  onChange={setArchiveDays}
                  options={ARCHIVE_DAY_OPTIONS}
                  style={{ width: 120 }}
                />
                <div>
                  <Text type="secondary">会话结束后超过此天数自动归档</Text>
                </div>
              </Form.Item>
            </Col>
          </Row>
          <Button type="primary" loading={savingArchive} onClick={handleSaveArchive}>
            保存
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default Settings;
