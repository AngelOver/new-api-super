/*
Copyright (C) 2025 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/

import React, { useEffect, useState, useContext } from 'react';
import {
  Button,
  Card,
  Form,
  Switch,
  Typography,
  Input,
} from '@douyinfe/semi-ui';
import { API, showError, showSuccess } from '../../../helpers';
import { useTranslation } from 'react-i18next';
import { StatusContext } from '../../../context/Status';

const { Text } = Typography;

export default function SettingsCustomerService(props) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [statusState, statusDispatch] = useContext(StatusContext);

  const [config, setConfig] = useState({
    enabled: false,
    login: {
      enabled: true,
      text: '如登录不了，',
      linkText: '点击联系客服',
      link: '',
    },
    register: {
      enabled: true,
      text: '如注册不了，',
      linkText: '点击联系客服',
      link: '',
    },
    topup: {
      enabled: true,
      text: '',
      linkText: '联系客服',
      link: '',
    },
  });

  function updateConfig(section, field, value) {
    if (section) {
      setConfig({
        ...config,
        [section]: {
          ...config[section],
          [field]: value,
        },
      });
    } else {
      setConfig({
        ...config,
        [field]: value,
      });
    }
  }

  async function onSubmit() {
    setLoading(true);
    try {
      const res = await API.put('/api/option/', {
        key: 'CustomerServiceConfig',
        value: JSON.stringify(config),
      });
      const { success, message } = res.data;
      if (success) {
        showSuccess(t('保存成功'));
        statusDispatch({
          type: 'set',
          payload: {
            ...statusState.status,
            CustomerServiceConfig: JSON.stringify(config),
          },
        });
        if (props.refresh) {
          await props.refresh();
        }
      } else {
        showError(message);
      }
    } catch (error) {
      showError(t('保存失败，请重试'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (props.options && props.options.CustomerServiceConfig) {
      try {
        const parsed = JSON.parse(props.options.CustomerServiceConfig);
        setConfig(parsed);
      } catch (error) {
        // 使用默认配置
      }
    }
  }, [props.options]);

  const sections = [
    { key: 'login', title: t('登录页面'), desc: t('登录页面显示的客服链接') },
    { key: 'register', title: t('注册页面'), desc: t('注册页面显示的客服链接') },
    { key: 'topup', title: t('充值页面'), desc: t('充值页面显示的客服链接') },
  ];

  return (
    <Card>
      <Form.Section
        text={t('客服链接配置')}
        extraText={t('配置登录、注册、充值页面的客服链接')}
      >
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Text strong>{t('启用客服链接')}</Text>
            <Switch
              checked={config.enabled}
              onChange={(checked) => updateConfig(null, 'enabled', checked)}
            />
          </div>
        </div>

        {config.enabled && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {sections.map((section) => (
              <Card
                key={section.key}
                style={{
                  background: 'var(--semi-color-bg-2)',
                  borderRadius: '8px',
                }}
                bodyStyle={{ padding: '16px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div>
                    <Text strong>{section.title}</Text>
                    <Text type='tertiary' size='small' style={{ marginLeft: '8px' }}>{section.desc}</Text>
                  </div>
                  <Switch
                    checked={config[section.key]?.enabled}
                    onChange={(checked) => updateConfig(section.key, 'enabled', checked)}
                    size='small'
                  />
                </div>
                
                {config[section.key]?.enabled && (
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <Input
                      placeholder={t('前置文字')}
                      value={config[section.key]?.text}
                      onChange={(value) => updateConfig(section.key, 'text', value)}
                      style={{ width: '180px' }}
                      size='small'
                    />
                    <Input
                      placeholder={t('链接文字')}
                      value={config[section.key]?.linkText}
                      onChange={(value) => updateConfig(section.key, 'linkText', value)}
                      style={{ width: '150px' }}
                      size='small'
                    />
                    <Input
                      placeholder={t('链接地址')}
                      value={config[section.key]?.link}
                      onChange={(value) => updateConfig(section.key, 'link', value)}
                      style={{ flex: 1, minWidth: '200px' }}
                      size='small'
                    />
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--semi-color-border)' }}>
          <Button
            type='primary'
            onClick={onSubmit}
            loading={loading}
            style={{ borderRadius: '6px', fontWeight: '500', minWidth: '100px' }}
          >
            {t('保存设置')}
          </Button>
        </div>
      </Form.Section>
    </Card>
  );
}
