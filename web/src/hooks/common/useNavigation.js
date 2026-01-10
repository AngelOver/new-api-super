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

import { useMemo } from 'react';

export const useNavigation = (t, docsLink, headerNavModules) => {
  const mainNavLinks = useMemo(() => {
    // 默认配置，如果没有传入配置则显示所有模块
    const defaultModules = {
      home: true,
      console: true,
      pricing: true,
      docs: true,
      about: true,
    };

    // 使用传入的配置或默认配置
    const modules = headerNavModules || defaultModules;

    const allLinks = [
      {
        text: t('首页'),
        itemKey: 'home',
        to: '/',
      },
      {
        text: t('控制台'),
        itemKey: 'console',
        to: '/console',
      },
      {
        text: t('模型广场'),
        itemKey: 'pricing',
        to: '/pricing',
      },
      ...(docsLink
        ? [
            {
              text: t('文档'),
              itemKey: 'docs',
              isExternal: true,
              externalLink: docsLink,
            },
          ]
        : []),
      {
        text: t('关于'),
        itemKey: 'about',
        to: '/about',
      },
    ];

    // 根据配置过滤导航链接
    const filteredLinks = allLinks.filter((link) => {
      if (link.itemKey === 'docs') {
        return docsLink && modules.docs;
      }
      if (link.itemKey === 'pricing') {
        // 支持新的pricing配置格式
        return typeof modules.pricing === 'object'
          ? modules.pricing.enabled
          : modules.pricing;
      }
      return modules[link.itemKey] === true;
    });

    // 添加自定义菜单
    const customMenus = modules.customMenus || [];
    
    // 计算 iframe 类型菜单的索引
    let iframeIndex = 0;
    const customLinks = customMenus
      .filter((menu) => {
        if (!menu.enabled || !menu.text || !menu.url) return false;
        return true;
      })
      .map((menu, index) => {
        const type = menu.type || 'internal';
        // internal: 内部路由跳转
        // iframe: 外链内嵌显示
        // external: 外链新标签页打开
        let to, isExternal, externalLink;
        
        if (type === 'internal') {
          to = menu.url;
          isExternal = false;
          externalLink = undefined;
        } else if (type === 'iframe') {
          // 使用 iframe 专属索引，从配置中读取
          to = `/iframe/${iframeIndex}`;
          iframeIndex++;
          isExternal = false;
          externalLink = undefined;
        } else {
          // external
          to = undefined;
          isExternal = true;
          externalLink = menu.url;
        }
        
        return {
          text: menu.text,
          itemKey: `custom_${index}`,
          to,
          isExternal,
          externalLink,
        };
      });

    return [...filteredLinks, ...customLinks];
  }, [t, docsLink, headerNavModules]);

  return {
    mainNavLinks,
  };
};
