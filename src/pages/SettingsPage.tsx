import { Typography, Card as AntCard } from 'antd';
import { SettingOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

export const SettingsPage = () => {
  return (
    <div style={{ padding: '24px' }}>
      <AntCard>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <SettingOutlined style={{ fontSize: '64px', color: '#1890ff', marginBottom: '16px' }} />
          <Title level={2}>Configuración de TalentHub Pro</Title>
          <Paragraph type="secondary">
            Esta página estará disponible próximamente. Aquí podrás configurar las opciones del sistema.
          </Paragraph>
        </div>
      </AntCard>
    </div>
  );
};
