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

import React, { useContext, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Typography } from '@douyinfe/semi-ui';
import { StatusContext } from '../../context/Status';

const { Title } = Typography;

const IframePage = () => {
  const { id } = useParams();
  const [statusState] = useContext(StatusContext);

  // 从配置中读取 iframe 菜单信息
  const menuConfig = useMemo(() => {
    try {
      const headerNavModulesConfig = statusState?.status?.HeaderNavModules;
      if (!headerNavModulesConfig) return null;
      
      const modules = JSON.parse(headerNavModulesConfig);
      const customMenus = modules.customMenus || [];
      
      // 找到所有 iframe 类型的菜单
      const iframeMenus = customMenus.filter((menu) => menu.type === 'iframe' && menu.enabled);
      const menuIndex = parseInt(id, 10);
      
      if (isNaN(menuIndex) || menuIndex < 0 || menuIndex >= iframeMenus.length) {
        return null;
      }
      
      return iframeMenus[menuIndex];
    } catch (error) {
      console.error('解析菜单配置失败:', error);
      return null;
    }
  }, [statusState?.status?.HeaderNavModules, id]);

  if (!menuConfig || !menuConfig.url) {
    return (
      <div className='flex items-center justify-center h-full'>
        <Title heading={4}>无效的链接</Title>
      </div>
    );
  }

  const { url, text: title } = menuConfig;

  return (
    <div className='w-full h-full flex flex-col'>
      {title && (
        <div className='px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-900'>
          <Title heading={5} className='!mb-0'>{title}</Title>
        </div>
      )}
      <iframe
        src={url}
        title={title}
        className='flex-1 w-full border-0'
        style={{ minHeight: 'calc(100vh - 120px)' }}
        sandbox='allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox'
      />
    </div>
  );
};

export default IframePage;
