import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Divider, Space, message, Input as AntInput } from 'antd';
import { UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { Button, Input, Card, Form, FormItem, useForm } from '../components/ui';
import { useAuth } from '../context/AuthContext';

const { Title, Text, Link } = Typography;

interface LoginFormData {
  email: string;
  password: string;
}

export const SignInPage = () => {
  const [form] = useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (values: LoginFormData) => {
    setLoading(true);
    try {
      await login(values.email, values.password);
      message.success('¡Inicio de sesión exitoso!');
      navigate('/dashboard');
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message || 'Error al iniciar sesión');
      } else {
        message.error('Error al iniciar sesión');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Card 
        style={{ 
          width: '100%', 
          maxWidth: 400,
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
        }}
        padding="large"
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Title level={2} style={{ marginBottom: 8, color: '#1890ff' }}>
              Bienvenido
            </Title>
            <Text type="secondary">
              Inicia sesión en tu cuenta
            </Text>
          </div>

          {/* Formulario */}
          <Form
            form={form}
            onFinish={handleSubmit}
            autoComplete="off"
          >
            <FormItem
              name="email"
              rules={[
                { required: true, message: 'Por favor ingresa tu email' },
                { type: 'email', message: 'Ingresa un email válido' }
              ]}
            >
              <Input
                size="large"
                placeholder="Correo electrónico"
                leftIcon={<UserOutlined />}
                fullWidth
              />
            </FormItem>

            <FormItem
              name="password"
              rules={[
                { required: true, message: 'Por favor ingresa tu contraseña' },
                { min: 6, message: 'La contraseña debe tener al menos 6 caracteres' }
              ]}
            >
              <AntInput.Password
                size="large"
                placeholder="Contraseña"
                prefix={<LockOutlined />}
                iconRender={(visible: boolean) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                style={{ width: '100%' }}
              />
            </FormItem>

            <FormItem>
              <Button
                variant="primary"
                size="large"
                fullWidth
                loading={loading}
                buttonType="submit"
              >
                Iniciar Sesión
              </Button>
            </FormItem>
          </Form>

          <Divider>o</Divider>

          {/* Enlaces adicionales */}
          <div style={{ textAlign: 'center' }}>
            <Space direction="vertical" size="small">
              <Link href="#" style={{ fontSize: '14px' }}>
                ¿Olvidaste tu contraseña?
              </Link>
              <Text style={{ fontSize: '14px' }}>
                ¿No tienes cuenta?{' '}
                <Link href="/signup">
                  Regístrate aquí
                </Link>
              </Text>
            </Space>
          </div>
        </Space>
      </Card>
    </div>
  );
};
