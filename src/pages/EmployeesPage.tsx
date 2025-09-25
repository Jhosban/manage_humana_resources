import { useState, useEffect } from 'react';
import { 
  Typography, 
  Card as AntCard, 
  Table, 
  Button, 
  Space, 
  message, 
  Modal, 
  Form, 
  Input, 
  Popconfirm, 
  Spin,
  Row,
  Col,
  Pagination,
  Select
} from 'antd';
import { 
  TeamOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined, 
  UndoOutlined 
} from '@ant-design/icons';
import { employeeService } from '../services/employeeService';
import type { Employee, EmployeeSearchParams } from '../services/types';
import { useData } from '../context/DataContext';

const { Title } = Typography;
const { Option } = Select;

export const EmployeesPage = () => {
  // Obtener el contexto de datos
  const { refreshDashboard } = useData();
  
  // State variables
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [createModalVisible, setCreateModalVisible] = useState<boolean>(false);
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [searchText, setSearchText] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('active');
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  // Fetch employees on component mount and when pagination or filters change
  useEffect(() => {
    fetchEmployees();
  }, [pagination.current, pagination.pageSize, statusFilter]);

  // Function to fetch employees
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const params: EmployeeSearchParams = {
        page: pagination.current,
        limit: pagination.pageSize,
        // Configurar correctamente los parámetros según el filtro de estado
        includeInactive: statusFilter !== 'active',
      };
      
      let response;
      if (searchText) {
        params.q = searchText;
        response = await employeeService.searchEmployees(params);
      } else {
        response = await employeeService.getEmployees(params);
      }
      
      // Filtrar los resultados si solo se quieren inactivos
      let filteredEmployees = response.data;
      if (statusFilter === 'inactive') {
        filteredEmployees = response.data.filter(emp => !emp.isActive);
      }
      
      // Ordenar los empleados por ID (de menor a mayor)
      const sortedEmployees = [...filteredEmployees].sort((a, b) => {
        const idA = a.businessEntityID || 0;
        const idB = b.businessEntityID || 0;
        return idA - idB;
      });
      
      // Establecer empleados filtrados y ordenados
      setEmployees(sortedEmployees);
      
      // Actualizar paginación (solo si no estamos filtrando por inactivos)
      if (statusFilter !== 'inactive') {
        setPagination({
          ...pagination,
          total: response.pagination.total,
        });
      } else {
        // Si estamos filtrando por inactivos, ajustar el total a la cantidad de empleados inactivos
        setPagination({
          ...pagination,
          total: filteredEmployees.length,
        });
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      message.error('No se pudieron cargar los empleados.');
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 });
    fetchEmployees();
  };

  // Handle create employee
  const handleCreate = async (values: Employee) => {
    try {
      await employeeService.createEmployee(values);
      message.success('Empleado creado exitosamente');
      setCreateModalVisible(false);
      createForm.resetFields();
      fetchEmployees();
      // Actualizar el dashboard
      refreshDashboard();
    } catch (error) {
      console.error('Error creating employee:', error);
      message.error('No se pudo crear el empleado');
    }
  };

  // Handle update employee
  const handleUpdate = async (values: Partial<Employee>) => {
    if (!currentEmployee?.businessEntityID) return;
    
    try {
      await employeeService.updateEmployee(currentEmployee.businessEntityID, values);
      message.success('Empleado actualizado exitosamente');
      setEditModalVisible(false);
      fetchEmployees();
      // Actualizar el dashboard
      refreshDashboard();
    } catch (error) {
      console.error('Error updating employee:', error);
      message.error('No se pudo actualizar el empleado');
    }
  };

  // Handle delete (deactivate) employee
  const handleDelete = async (id: number) => {
    try {
      await employeeService.deleteEmployee(id);
      message.success('Empleado desactivado exitosamente');
      fetchEmployees();
      // Actualizar el dashboard
      refreshDashboard();
    } catch (error) {
      console.error('Error deactivating employee:', error);
      message.error('No se pudo desactivar el empleado');
    }
  };

  // Handle reactivate employee
  const handleReactivate = async (id: number) => {
    try {
      await employeeService.reactivateEmployee(id);
      message.success('Empleado reactivado exitosamente');
      fetchEmployees();
      // Actualizar el dashboard
      refreshDashboard();
    } catch (error) {
      console.error('Error reactivating employee:', error);
      message.error('No se pudo reactivar el empleado');
    }
  };

  // Open edit modal and populate form with employee data
  const showEditModal = (employee: Employee) => {
    setCurrentEmployee(employee);
    editForm.setFieldsValue({
      name: employee.name,
      departamento: employee.departamento,
      personPhone: employee.personPhone,
      email: employee.email,
    });
    setEditModalVisible(true);
  };

  // Table columns definition
  const columns = [
    {
      title: 'ID',
      dataIndex: 'businessEntityID',
      key: 'businessEntityID',
      width: 80,
    },
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
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
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Estado',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <span style={{ color: isActive ? 'green' : 'red' }}>
          {isActive ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 200,
      render: (_: any, record: Employee) => (
        <Space size="small">
          <Button 
            icon={<EditOutlined />} 
            type="primary" 
            size="small" 
            onClick={() => showEditModal(record)}
          >
            Editar
          </Button>
          {record.isActive ? (
            <Popconfirm
              title="¿Estás seguro de desactivar este empleado?"
              onConfirm={() => handleDelete(record.businessEntityID!)}
              okText="Sí"
              cancelText="No"
            >
              <Button icon={<DeleteOutlined />} danger size="small">
                Desactivar
              </Button>
            </Popconfirm>
          ) : (
            <Button 
              icon={<UndoOutlined />} 
              type="dashed" 
              size="small" 
              onClick={() => handleReactivate(record.businessEntityID!)}
            >
              Reactivar
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <AntCard>
        <Title level={2}>
          <TeamOutlined style={{ marginRight: '8px' }} />
          Gestión de Empleados
        </Title>

        {/* Search and filters */}
        <Row gutter={16} style={{ marginBottom: '16px' }}>
          <Col span={8}>
            <Input
              placeholder="Buscar empleados..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
              suffix={<SearchOutlined onClick={handleSearch} style={{ cursor: 'pointer' }} />}
            />
          </Col>
          <Col span={4}>
            <Select 
              value={statusFilter} 
              onChange={value => setStatusFilter(value)}
              style={{ width: '100%' }}
            >
              <Option value="all">Todos</Option>
              <Option value="active">Solo activos</Option>
              <Option value="inactive">Solo inactivos</Option>
            </Select>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => setCreateModalVisible(true)}
            >
              Nuevo Empleado
            </Button>
          </Col>
        </Row>

        {/* Employees table */}
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={employees.map(emp => ({ ...emp, key: emp.businessEntityID }))}
            pagination={false}
            bordered
            size="middle"
            scroll={{ x: 'max-content' }}
          />
          <Row justify="end" style={{ marginTop: 16 }}>
            <Pagination
              current={pagination.current}
              pageSize={pagination.pageSize}
              total={pagination.total}
              showSizeChanger
              showQuickJumper
              showTotal={(total) => `Total ${total} empleados`}
              onChange={(page, pageSize) => {
                setPagination({
                  ...pagination,
                  current: page,
                  pageSize: pageSize || 10,
                });
              }}
            />
          </Row>
        </Spin>
      </AntCard>

      {/* Create Employee Modal */}
      <Modal
        title="Crear Nuevo Empleado"
        visible={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          createForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreate}
        >
          <Form.Item
            label="Nombre"
            name="name"
            rules={[{ required: true, message: 'Ingresa el nombre del empleado' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            label="Departamento"
            name="departamento"
            rules={[{ required: true, message: 'Ingresa el departamento' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            label="Teléfono"
            name="personPhone"
            rules={[{ required: true, message: 'Ingresa el número de teléfono' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Ingresa el email' },
              { type: 'email', message: 'Ingresa un email válido' }
            ]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item>
            <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setCreateModalVisible(false);
                createForm.resetFields();
              }}>
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit">
                Crear
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Employee Modal */}
      <Modal
        title="Editar Empleado"
        visible={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleUpdate}
        >
          <Form.Item
            label="Nombre"
            name="name"
            rules={[{ required: true, message: 'Ingresa el nombre del empleado' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            label="Departamento"
            name="departamento"
            rules={[{ required: true, message: 'Ingresa el departamento' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            label="Teléfono"
            name="personPhone"
            rules={[{ required: true, message: 'Ingresa el número de teléfono' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Ingresa el email' },
              { type: 'email', message: 'Ingresa un email válido' }
            ]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item>
            <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={() => setEditModalVisible(false)}>
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit">
                Actualizar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
