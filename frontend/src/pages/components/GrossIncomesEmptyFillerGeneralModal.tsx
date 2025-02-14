import React, { useState } from 'react';
import { Modal, DatePicker, Form, Button } from 'antd';
import dayjs, { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;

interface DateRangeModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: { period: string }) => void;
}

const DateRangeModal: React.FC<DateRangeModalProps> = ({ visible, onCancel, onSubmit }) => {
  const [form] = Form.useForm();
  const [period, setPeriod] = useState<Dayjs | null>(null);

  const handleSubmit = () => {
    if (!period) {
      return;
    }

    onSubmit({
      period: period.format('YYYY-MM-DD'),
    });

    // Reset form and close modal
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="Seleccionar Rango de Fechas"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancelar
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          Aceptar
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item label="Rango de Fecha" required>
          <DatePicker
            picker="month" // Restrict the picker to months only
            value={period}
            onChange={(dates) => setPeriod(dates)}
            style={{ width: '100%' }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default DateRangeModal;