import React, { useState } from 'react';
import { Modal, DatePicker, Select, Form, Button } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { BranchOffice, Business } from '../util/types'; // Adjust the import path as needed

const { RangePicker } = DatePicker;
const { Option } = Select;

interface DateRangeModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: { businessId: number; branchOfficeId?: number; startDate: string; endDate: string }) => void;
  business: Business;
  branchOffices: BranchOffice[];
}


const DateRangeModal: React.FC<DateRangeModalProps> = ({ visible, onCancel, onSubmit, business, branchOffices }) => {
  const [form] = Form.useForm();
  const [selectedBranchOfficeId, setSelectedBranchOfficeId] = useState<number | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);

  console.log({business, branchOffices})

  const handleSubmit = () => {
    if (!dateRange) {
      return; // Ensure a date range is selected
    }

    const [startDate, endDate] = dateRange;
    onSubmit({
      businessId: business.id,
      branchOfficeId: selectedBranchOfficeId,
      startDate: startDate.format('YYYY-MM-DD'),
      endDate: endDate.format('YYYY-MM-DD'),
    });

    // Reset form and close modal
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="Generando Declaraciones Vacías"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancelar
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          Generar
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item label="Sede">
          <Select
            placeholder="Selecciones Una Sede"
            value={selectedBranchOfficeId}
            onChange={(value) => setSelectedBranchOfficeId(value)}
            
          >
            <Option value={undefined}>NINGUNA</Option>
            {branchOffices.map((branch) => (
              <Option key={branch.id} value={branch.id}>
                {branch.nickname}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Rango de Fecha" required>
          <RangePicker
            picker="month" 
            value={dateRange}
            onChange={(dates) => setDateRange(dates)}
            style={{ width: '100%' }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default DateRangeModal;