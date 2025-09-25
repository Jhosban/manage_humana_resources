import { useState, useEffect } from 'react';
import { 
  Typography, 
  Row, 
  Col, 
  Statistic, 
  Space, 
  Table,
  Tag,
  Progress,
  Spin,
  message
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  UserOutlined, 
  TeamOutlined, 
  CalendarOutlined, 
  DashboardOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { 
  Card, 
  Button 
} from '../components/ui';
import { employeeService } from '../services/employeeService';
import type { Employee } from '../services/types';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';

const { Title } = Typography;

// Adaptador para convertir Employee de la API a DisplayEmployee
const mapToDisplayEmployee = (employee: Employee): Employee & { 
  key: string,
  status: 'active' | 'inactive',
  performance: number 
} => {
  return {
    ...employee,
    key: employee.businessEntityID?.toString() || '',
    status: employee.isActive ? 'active' : 'inactive',
    performance: Math.floor(Math.random() * 30) + 70, // Rendimiento aleatorio entre 70-100%
  };
};

export const DashboardPage = () => {
  // Empleados para mostrar en la tabla (paginados)
  const [employees, setEmployees] = useState<Array<Employee & { 
    key: string,
    status: 'active' | 'inactive',
    performance: number 
  }>>([]);

  // Todos los empleados para estadísticas
  const [allEmployees, setAllEmployees] = useState<Array<Employee & { 
    key: string,
    status: 'active' | 'inactive',
    performance: number 
  }>>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [departmentStats, setDepartmentStats] = useState<{[key: string]: number}>({});
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });

  // Usar el contexto para la actualización de datos
  const { refreshDashboard } = useData();
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Actualizar el contador local cuando el contexto global cambia
  useEffect(() => {
    setRefreshTrigger(prev => prev + 1);
  }, [refreshDashboard]);

  // Cargar empleados desde la API
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);

        // Primero obtenemos todos los empleados para estadísticas (sin paginación), incluyendo inactivos
        const allEmployeesResponse = await employeeService.getEmployees({ 
          limit: 1000,
          includeInactive: true
        });
        const allMappedEmployees = allEmployeesResponse.data.map(mapToDisplayEmployee);
        setAllEmployees(allMappedEmployees);
        
        // Luego obtenemos los empleados paginados para mostrar en la tabla (incluyendo inactivos)
        const response = await employeeService.getEmployees({ 
          page: pagination.current,
          limit: pagination.pageSize,
          includeInactive: true
        });
        
        const mappedEmployees = response.data.map(mapToDisplayEmployee);
        
        // Ordenar los empleados por ID para mantener su posición
        const sortedEmployees = [...mappedEmployees].sort((a, b) => {
          const idA = Number(a.businessEntityID) || 0;
          const idB = Number(b.businessEntityID) || 0;
          return idA - idB;
        });
        
        setEmployees(sortedEmployees);
        
        // Actualizar la paginación con el total
        setPagination(prev => ({
          ...prev,
          total: response.pagination.total
        }));
        
        // Calcular estadísticas de departamentos usando todos los empleados
        const departments: {[key: string]: number} = {};
        allMappedEmployees.forEach(emp => {
          if (emp.departamento) {
            departments[emp.departamento] = (departments[emp.departamento] || 0) + 1;
          }
        });
        setDepartmentStats(departments);
      } catch (error) {
        console.error('Error al cargar empleados:', error);
        message.error('No se pudieron cargar los datos de empleados');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [pagination.current, pagination.pageSize, refreshTrigger]);

  // Calcular el rendimiento promedio usando todos los empleados (solo para visualización)
  const averagePerformance = allEmployees.length > 0 
    ? Math.round(allEmployees.reduce((acc, emp) => acc + emp.performance, 0) / allEmployees.length) 
    : 0;

  const columns: ColumnsType<Employee & { key: string, status: 'active' | 'inactive', performance: number }> = [
    {
      title: 'ID',
      dataIndex: 'businessEntityID',
      key: 'businessEntityID',
      width: 70,
    },
    {
      title: 'Empleado',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Space>
          <UserOutlined style={{ fontSize: '16px', color: '#1890ff' }} />
          <span style={{ fontWeight: 500 }}>{text}</span>
        </Space>
      ),
    },
    {
      title: 'Departamento',
      dataIndex: 'departamento',
      key: 'departamento',
    },
    {
      title: 'Teléfono',
      dataIndex: 'personPhone',
      key: 'personPhone',
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status: 'active' | 'inactive') => {
        const statusConfig = {
          active: { color: 'green', text: 'Activo' },
          inactive: { color: 'red', text: 'Inactivo' }
        };
        return (
          <Tag color={statusConfig[status].color}>
            {statusConfig[status].text}
          </Tag>
        );
      },
    },
    {
      title: 'Rendimiento',
      dataIndex: 'performance',
      key: 'performance',
      render: (performance: number) => (
        <Progress 
          percent={performance} 
          size="small" 
          status={performance >= 80 ? 'success' : performance >= 60 ? 'normal' : 'exception'}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Spin spinning={loading}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Métricas principales */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Card hoverable>
                <Statistic
                  title="Total Empleados"
                  value={allEmployees.length}
                  prefix={<TeamOutlined style={{ color: '#1890ff' }} />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card hoverable>
                <Statistic
                  title="Empleados Activos"
                  value={allEmployees.filter(emp => emp.status === 'active').length}
                  prefix={<UserOutlined style={{ color: '#52c41a' }} />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card hoverable>
                <Statistic
                  title="Empleados Inactivos"
                  value={allEmployees.filter(emp => emp.status === 'inactive').length}
                  prefix={<CalendarOutlined style={{ color: '#faad14' }} />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card hoverable>
                <Statistic
                  title="Rendimiento Promedio"
                  value={averagePerformance}
                  suffix="%"
                  prefix={<DashboardOutlined style={{ color: '#722ed1' }} />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Tabla de empleados */}
          <Card 
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={4} style={{ margin: 0 }}>
                  Gestión de Empleados
                </Title>
                <Link to="/employees">
                  <Button variant="primary">
                    <TeamOutlined /> Ver todos los empleados
                  </Button>
                </Link>
              </div>
            }
          >
            <Table
              columns={columns}
              dataSource={employees}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `Total ${total} empleados`,
                onChange: (page, pageSize) => {
                  setPagination({
                    ...pagination,
                    current: page,
                    pageSize: pageSize || 5,
                  });
                },
              }}
              scroll={{ x: 800 }}
            />
          </Card>

          {/* Gráficos de rendimiento por departamento */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card 
                title="Distribución por Departamento"
                hoverable
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  {Object.entries(departmentStats).map(([dept, count]) => {
                    const percentage = Math.round((count / employees.length) * 100);
                    return (
                      <div key={dept}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span>{dept}</span>
                          <span style={{ fontWeight: 500 }}>{count} empleados</span>
                        </div>
                        <Progress percent={percentage} showInfo={false} />
                      </div>
                    );
                  })}
                </Space>
              </Card>
            </Col>
            
            <Col xs={24} lg={12}>
              <Card 
                title="Acciones Rápidas"
                hoverable={false}
                variant="default"
              >
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  <Link to="/employees" style={{ display: 'block', width: '100%' }}>
                    <Button variant="outline" fullWidth size="large" style={{ opacity: 1 }}>
                      <UserOutlined /> Gestionar Empleados
                    </Button>
                  </Link>
                  <Button variant="outline" fullWidth size="large" style={{ opacity: 1 }}>
                    <CalendarOutlined /> Programar Evaluación
                  </Button>
                  <Button variant="outline" fullWidth size="large" style={{ opacity: 1 }}>
                    <TeamOutlined /> Generar Reporte
                  </Button>
                  <Link to="/settings" style={{ display: 'block', width: '100%' }}>
                    <Button variant="outline" fullWidth size="large" style={{ opacity: 1 }}>
                      <SettingOutlined /> Configurar Sistema
                    </Button>
                  </Link>
                </Space>
              </Card>
            </Col>
          </Row>
        </Space>
      </Spin>
    </div>
  );
};
