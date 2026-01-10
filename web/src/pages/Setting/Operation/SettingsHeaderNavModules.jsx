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
  Col,
  Form,
  Row,
  Switch,
  Typography,
  Input,
  Select,
} from '@douyinfe/semi-ui';
import { IconPlus, IconDelete } from '@douyinfe/semi-icons';
import { API, showError, showSuccess } from '../../../helpers';
import { useTranslation } from 'react-i18next';
import { StatusContext } from '../../../context/Status';

const { Text } = Typography;

export default function SettingsHeaderNavModules(props) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [statusState, statusDispatch] = useContext(StatusContext);

  // 顶栏模块管理状态
  const [headerNavModules, setHeaderNavModules] = useState({
    home: true,
    console: true,
    pricing: {
      enabled: true,
      requireAuth: false, // 默认不需要登录鉴权
    },
    docs: true,
    about: true,
    customMenus: [], // 自定义菜单数组
  });

  // 处理顶栏模块配置变更
  function handleHeaderNavModuleChange(moduleKey) {
    return (checked) => {
      const newModules = { ...headerNavModules };
      if (moduleKey === 'pricing') {
        // 对于pricing模块，只更新enabled属性
        newModules[moduleKey] = {
          ...newModules[moduleKey],
          enabled: checked,
        };
      } else {
        newModules[moduleKey] = checked;
      }
      setHeaderNavModules(newModules);
    };
  }

  // 处理模型广场权限控制变更
  function handlePricingAuthChange(checked) {
    const newModules = { ...headerNavModules };
    newModules.pricing = {
      ...newModules.pricing,
      requireAuth: checked,
    };
    setHeaderNavModules(newModules);
  }

  // 重置顶栏模块为默认配置
  function resetHeaderNavModules() {
    const defaultModules = {
      home: true,
      console: true,
      pricing: {
        enabled: true,
        requireAuth: false,
      },
      docs: true,
      about: true,
      customMenus: [],
    };
    setHeaderNavModules(defaultModules);
    showSuccess(t('已重置为默认配置'));
  }

  // 添加自定义菜单
  function addCustomMenu() {
    const newMenus = [...(headerNavModules.customMenus || [])];
    newMenus.push({
      text: '',
      url: '',
      type: 'internal', // 'internal' 内部路由, 'iframe' 外链内嵌, 'external' 外链跳转
      enabled: true,
    });
    setHeaderNavModules({ ...headerNavModules, customMenus: newMenus });
  }

  // 删除自定义菜单
  function removeCustomMenu(index) {
    const newMenus = [...(headerNavModules.customMenus || [])];
    newMenus.splice(index, 1);
    setHeaderNavModules({ ...headerNavModules, customMenus: newMenus });
  }

  // 更新自定义菜单
  function updateCustomMenu(index, field, value) {
    const newMenus = [...(headerNavModules.customMenus || [])];
    newMenus[index] = { ...newMenus[index], [field]: value };
    setHeaderNavModules({ ...headerNavModules, customMenus: newMenus });
  }

  // 保存配置
  async function onSubmit() {
    setLoading(true);
    try {
      const res = await API.put('/api/option/', {
        key: 'HeaderNavModules',
        value: JSON.stringify(headerNavModules),
      });
      const { success, message } = res.data;
      if (success) {
        showSuccess(t('保存成功'));

        // 立即更新StatusContext中的状态
        statusDispatch({
          type: 'set',
          payload: {
            ...statusState.status,
            HeaderNavModules: JSON.stringify(headerNavModules),
          },
        });

        // 刷新父组件状态
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
    // 从 props.options 中获取配置
    if (props.options && props.options.HeaderNavModules) {
      try {
        const modules = JSON.parse(props.options.HeaderNavModules);

        // 处理向后兼容性：如果pricing是boolean，转换为对象格式
        if (typeof modules.pricing === 'boolean') {
          modules.pricing = {
            enabled: modules.pricing,
            requireAuth: false, // 默认不需要登录鉴权
          };
        }

        // 确保 customMenus 存在
        if (!modules.customMenus) {
          modules.customMenus = [];
        }
        setHeaderNavModules(modules);
      } catch (error) {
        // 使用默认配置
        const defaultModules = {
          home: true,
          console: true,
          pricing: {
            enabled: true,
            requireAuth: false,
          },
          docs: true,
          about: true,
          customMenus: [],
        };
        setHeaderNavModules(defaultModules);
      }
    }
  }, [props.options]);

  // 模块配置数据
  const moduleConfigs = [
    {
      key: 'home',
      title: t('首页'),
      description: t('用户主页，展示系统信息'),
    },
    {
      key: 'console',
      title: t('控制台'),
      description: t('用户控制面板，管理账户'),
    },
    {
      key: 'pricing',
      title: t('模型广场'),
      description: t('模型定价，需要登录访问'),
      hasSubConfig: true, // 标识该模块有子配置
    },
    {
      key: 'docs',
      title: t('文档'),
      description: t('系统文档和帮助信息'),
    },
    {
      key: 'about',
      title: t('关于'),
      description: t('关于系统的详细信息'),
    },
  ];

  return (
    <Card>
      <Form.Section
        text={t('顶栏管理')}
        extraText={t('控制顶栏模块显示状态，全局生效')}
      >
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          {moduleConfigs.map((module) => (
            <Col key={module.key} xs={24} sm={12} md={6} lg={6} xl={6}>
              <Card
                style={{
                  borderRadius: '8px',
                  border: '1px solid var(--semi-color-border)',
                  transition: 'all 0.2s ease',
                  background: 'var(--semi-color-bg-1)',
                  minHeight: '80px',
                }}
                bodyStyle={{ padding: '16px' }}
                hoverable
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    height: '100%',
                  }}
                >
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div
                      style={{
                        fontWeight: '600',
                        fontSize: '14px',
                        color: 'var(--semi-color-text-0)',
                        marginBottom: '4px',
                      }}
                    >
                      {module.title}
                    </div>
                    <Text
                      type='secondary'
                      size='small'
                      style={{
                        fontSize: '12px',
                        color: 'var(--semi-color-text-2)',
                        lineHeight: '1.4',
                        display: 'block',
                      }}
                    >
                      {module.description}
                    </Text>
                  </div>
                  <div style={{ marginLeft: '16px' }}>
                    <Switch
                      checked={
                        module.key === 'pricing'
                          ? headerNavModules[module.key]?.enabled
                          : headerNavModules[module.key]
                      }
                      onChange={handleHeaderNavModuleChange(module.key)}
                      size='default'
                    />
                  </div>
                </div>

                {/* 为模型广场添加权限控制子开关 */}
                {module.key === 'pricing' &&
                  (module.key === 'pricing'
                    ? headerNavModules[module.key]?.enabled
                    : headerNavModules[module.key]) && (
                    <div
                      style={{
                        borderTop: '1px solid var(--semi-color-border)',
                        marginTop: '12px',
                        paddingTop: '12px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div style={{ flex: 1, textAlign: 'left' }}>
                          <div
                            style={{
                              fontWeight: '500',
                              fontSize: '12px',
                              color: 'var(--semi-color-text-1)',
                              marginBottom: '2px',
                            }}
                          >
                            {t('需要登录访问')}
                          </div>
                          <Text
                            type='secondary'
                            size='small'
                            style={{
                              fontSize: '11px',
                              color: 'var(--semi-color-text-2)',
                              lineHeight: '1.4',
                              display: 'block',
                            }}
                          >
                            {t('开启后未登录用户无法访问模型广场')}
                          </Text>
                        </div>
                        <div style={{ marginLeft: '16px' }}>
                          <Switch
                            checked={
                              headerNavModules.pricing?.requireAuth || false
                            }
                            onChange={handlePricingAuthChange}
                            size='default'
                          />
                        </div>
                      </div>
                    </div>
                  )}
              </Card>
            </Col>
          ))}
        </Row>

        {/* 自定义菜单配置 */}
        <Card
          style={{
            marginBottom: '24px',
            borderRadius: '8px',
            border: '1px solid var(--semi-color-border)',
          }}
          bodyStyle={{ padding: '16px' }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}
          >
            <div>
              <div
                style={{
                  fontWeight: '600',
                  fontSize: '14px',
                  color: 'var(--semi-color-text-0)',
                  marginBottom: '4px',
                }}
              >
                {t('自定义菜单')}
              </div>
              <Text
                type='secondary'
                size='small'
                style={{ fontSize: '12px' }}
              >
                {t('添加自定义导航链接，支持内部路由和外部链接')}
              </Text>
            </div>
            <Button
              icon={<IconPlus />}
              onClick={addCustomMenu}
              size='small'
            >
              {t('添加菜单')}
            </Button>
          </div>

          {(headerNavModules.customMenus || []).length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '20px',
                color: 'var(--semi-color-text-2)',
              }}
            >
              {t('暂无自定义菜单，点击上方按钮添加')}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(headerNavModules.customMenus || []).map((menu, index) => (
                <Card
                  key={index}
                  style={{
                    background: 'var(--semi-color-bg-2)',
                    borderRadius: '6px',
                  }}
                  bodyStyle={{ padding: '12px' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <Switch
                      checked={menu.enabled}
                      onChange={(checked) =>
                        updateCustomMenu(index, 'enabled', checked)
                      }
                      size='small'
                    />
                    <Input
                      placeholder={t('菜单名称')}
                      value={menu.text}
                      onChange={(value) =>
                        updateCustomMenu(index, 'text', value)
                      }
                      style={{ width: '120px' }}
                      size='small'
                    />
                    <Select
                      value={menu.type || 'internal'}
                      onChange={(value) =>
                        updateCustomMenu(index, 'type', value)
                      }
                      style={{ width: '120px' }}
                      size='small'
                    >
                      <Select.Option value='internal'>{t('内部页面')}</Select.Option>
                      <Select.Option value='iframe'>{t('外链内嵌')}</Select.Option>
                      <Select.Option value='external'>{t('外链跳转')}</Select.Option>
                    </Select>
                    <Input
                      placeholder={
                        (menu.type || 'internal') === 'internal'
                          ? t('内部路由 (如 /help)')
                          : t('链接地址 (如 https://...)')
                      }
                      value={menu.url}
                      onChange={(value) =>
                        updateCustomMenu(index, 'url', value)
                      }
                      style={{ flex: 1 }}
                      size='small'
                    />
                    <Button
                      icon={<IconDelete />}
                      type='danger'
                      theme='borderless'
                      onClick={() => removeCustomMenu(index)}
                      size='small'
                    />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>

        <div
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-start',
            alignItems: 'center',
            paddingTop: '8px',
            borderTop: '1px solid var(--semi-color-border)',
          }}
        >
          <Button
            size='default'
            type='tertiary'
            onClick={resetHeaderNavModules}
            style={{
              borderRadius: '6px',
              fontWeight: '500',
            }}
          >
            {t('重置为默认')}
          </Button>
          <Button
            size='default'
            type='primary'
            onClick={onSubmit}
            loading={loading}
            style={{
              borderRadius: '6px',
              fontWeight: '500',
              minWidth: '100px',
            }}
          >
            {t('保存设置')}
          </Button>
        </div>
      </Form.Section>
    </Card>
  );
}
