import React, { Children, useEffect, useState } from 'react'
import { Badge, Card, Descriptions, Divider, FormProps, List, Modal, Space, Switch } from 'antd'
import { 
  Form, 
  Input, 
  Button, 
  message, 
  Typography, 
  Select, 
  Flex, 
  Image, 
  Table,
  Tabs,
  DatePicker,
  Popconfirm,
  TimePicker
} from 'antd'
const { Title, Paragraph } = Typography
import { useParams, Link, useNavigate, Navigate } from 'react-router-dom';
import dayjs from 'dayjs'

import { Business, BranchOffice, License, EconomicActivity } from '../util/types'

import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { CurrencyHandler, percentHandler } from '../util/currency';

import * as api from '../util/api'
import * as businessesApi from '../util/businessesApi'
import * as economicLicenseApi from '../util/economicLicenseApi'
import economicActivitiesService from '../services/EconomicActivitiesService'
import * as inactivityPeriodService from '../services/inactivityPeriodService'

import { completeUrl } from './BusinessShared';

import useAuthentication from '../hooks/useAuthentication';
import { render } from '@testing-library/react';

const IP = process.env.BACKEND_IP || "localhost"
const PORT = "3000"
const HOST = "http://" + IP + ":" + PORT

const reminderIntervalMap: { [key: number]: string } = {
  30: "Una vez al més",
  3: "Cada 3 días",
  7: "Cada 7 días",
  15: "Cada 15 días",
}

function BusinessViewDetails(): JSX.Element {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [business, setBusiness] = useState<Business>()
  const { businessId } = useParams();
  const [economicLicenses, setEconomicLicenses] = useState<EconomicLicense[]>([])
  const [economicActivity, setEconomicActivity] = useState<EconomicActivity>()
  const navigate = useNavigate()

  const { userAuth } = useAuthentication()

  const [licenseStatus, setLicenseStatus] = useState()

  console.log({ business })

  let [shouldUpdatePreferredChanel, setShouldUpdatePreferredChanel] = React.useState<boolean>(false)

  useEffect(() => {
    // first load of data
    loadBusinessData()
    loadEconomicLicenses()    
  }, [])

  useEffect(() => {
    if (business?.id) {
      loadEconomicActivity()
    }
  }, [business])

  const loadEconomicLicenses = async () => {
    const licenses = await economicLicenseApi.findAll({
      filters: {
        businessId
      },
      token: userAuth.token
    })
    console.log({ licenses })
    setEconomicLicenses(licenses?.filter(license => license.businessId === Number(businessId)))
  }

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleDeleteBusiness = async () => {
    setIsModalOpen(false);

    try {
      business?.id && await businessesApi.deleteBusiness(business?.id, userAuth.token ?? '');

      navigate('/business')

    } catch (error) {
      message.error(error.message);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  async function loadBusinessData() {
    // get the business data 
    // feed the form with the business data
    if (businessId) {
      let fetchedBusiness = await api.fetchBusinessById(Number(businessId))
      let branchOffices = await api.fetchBranchOffices(Number(businessId))
      // TODO: Add case when there is not branch office

      // console.log({ branchOffices })
      setBusiness({ ...fetchedBusiness, branchOffices })
    }

    // call the isBusinessEligibleForEconomicLicense function in businessApi and pass the business id
    let status = await businessesApi.isBusinessEligibleForEconomicLicense(Number(businessId))

    setLicenseStatus({ ...status })

  }

  async function loadEconomicActivity() {
    if (business) {
      const {economicActivityId} = business
      const economicActivity = await economicActivitiesService.findById(economicActivityId)

      setEconomicActivity(economicActivity)
    }
  }

  async function handleNewEconomicLicense() {
    try {
      const result = await economicLicenseApi.requestNewEconomicLicense(businessId, {})
      console.log({ result })

      loadEconomicLicenses()
    } catch (error) {
      console.log({ error })
    }
  }

  

  async function handleNewBranchOffice() {
    // travel to /businesses/:businessId/branch-offices/new
    navigate(`/businesses/${businessId}/branch-offices/new`)
  }

  async function handleDeleteBranchOffice(id: number) {
    try {
      console.log(`Deleting branch office #${id}`)
      await api.deleteBranchOffice(id, userAuth.token ?? '')

      loadBusinessData()
    } catch (error) {
      console.log({ error })
      message.error(error.message)
    }

  }

  async function handleEditBranchOffice(id: number) {
    // travel to /businesses/:businessId/branch-offices/:branchOfficeId/edit
    navigate(`/businesses/${businessId}/branch-offices/${id}/edit`)
  }

  if (!business) {
    return (<div>Cargando</div>)
  }

  const tabsItems = [
    {
      label: 'General',
      key: 'general',
      children: <Flex vertical gap={16}>
        <GeneralInformationDescription
          business={business}
        />

        <EconomicActivityDescription
          economicActivity={economicActivity}
        />
      </Flex>
    },
    {
      label: 'Sedes',
      key: 'branchOffices',
      children: <BranchOfficesDisplay
        branchOffices={business?.branchOffices}
        onNew={handleNewBranchOffice}
        onDelete={handleDeleteBranchOffice}
        onEdit={handleEditBranchOffice}
      />
    },
    {
      label: 'Comunicación',
      key: 'communication-preference',
      children: <CommunicationDisplay business={business} />
    },
    {
      label: 'Licencia de Actividad Económica',
      key: 'economic-license',
      children: <EconomicLicensesTab
        businessId={Number(businessId)}
        onNew={handleNewEconomicLicense}
        licenseStatus={licenseStatus}
        economicLicenses={economicLicenses}
      />
    },
    {
      label: 'Cartas de Inactividad',
      key: 'inactivity-letters',
      children: <InactivityLettersDisplay
          businessId={Number(businessId)}
          branchOffices={business?.branchOffices}
        />
    }
  ]

  return (
    <Card
      title={
        <Flex align='center' wrap style={{ marginBottom: '20px' }} justify='space-between'>
          <Title style={{ marginRight: '20px' }} style={{ textWrap: 'wrap' }}>
            {`${business?.businessName} - ${ business.isActive ? "Activo" : "Inactivo"}` || "Cargando..."}
          </Title>
          <Flex gap={'middle'}>
            <Button
              data-test="business-edit-button"
              onClick={() => navigate(`/business/edit/${businessId}`)}>
                <EditOutlined />
                Editar
            </Button>
            <Button
              danger
              data-test="business-delete-button"
              onClick={() => business.id && showModal()}>
                <DeleteOutlined/>
                Eliminar
            </Button>
          </Flex>
        </Flex>
      }
    >
      <Tabs 
        defaultActiveKey="general" 
        items={tabsItems}
        type="card"
      />
        

      <Modal title="Eliminar Contribuyente"
        data-test='business-delete-modal'
        open={isModalOpen}
        onOk={handleDeleteBusiness}
        onCancel={handleCancel}>
        <p>¿Seguro que deseas eliminar este contribuyente?</p>
      </Modal>
    </Card>
  )
}

export default BusinessViewDetails

function InactivityLettersDisplay({ businessId, branchOffices }: { businessId: number, branchOffices: BranchOffice[]}): JSX.Element {

  const [periods, setPeriods] = useState<IInactivityLetter[]>([])
  const { userAuth } = useAuthentication();
  const token = userAuth.token;

  if (!businessId || !token) return <></>

  const loadInactivityPeriods = async () => {
    try {
      let periods = await inactivityPeriodService.getInactivityPeriods(businessId, token)

      setPeriods([...periods])
    } catch (err) {
      console.log({ err })
    }
  }

  const [showEditForm, setShowEditForm] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<IInactivityLetter | null>(null)

  async function handleNew(newLetter: IInactivityLetter){

    try {

      let createdLetter = await inactivityPeriodService.createInactivityPeriod({
        businessId,
        ...newLetter
      }, token)
      
      setShowEditForm(false)
      loadInactivityPeriods()
    } catch (err) {
      if (err.response?.data?.error?.name === 'InvalidPeriod') {
        message.error('La fecha de inicio debe ser menor a la fecha de fin')
      }

      console.log({ err })
    }
  }

  
  async function handleEdit(id: number, data: IInactivityLetter) {
    let updatedLetter = await inactivityPeriodService.updateInactivityPeriod(id, data, token)


    setSelectedPeriod(null)
    setShowEditForm(false)
    loadInactivityPeriods()
  }

  async function handleDelete(id: number){
    await inactivityPeriodService.deleteInactivityPeriod(id, token)

    loadInactivityPeriods()
  }

  function handleCancelModal() {

    setSelectedPeriod(null)
    setShowEditForm(false)
    loadInactivityPeriods()
  }

  function handleOpenModalForEdit(letterId: number) {

    const selectedPeriod = periods.find(periods => periods.id === letterId)

    if (selectedPeriod) {
      setSelectedPeriod(selectedPeriod)
      setShowEditForm(true)
    }
  }



  interface IInactivityLetter {
    id: number,
    startAt: dayjs.Dayjs,
    endAt: dayjs.Dayjs | null,
    branchOfficeId: number,
    branchOffice: IBranchOffice,
    comment: string
  }

  const columns = [
    {
      title: 'Inicia',
      dataIndex: 'startAt',
      key: 'startAt',
      render: (date: dayjs.Dayjs) => dayjs(date).format('DD [de] MMMM [del] YYYY'),
      sorter: (a, b) => {
        
        if (!a.startAt || !b.startAt) return 0

        return dayjs(a.startAt).isBefore(dayjs(b.startAt)) ? 1 : -1
      },
      sortDirections: ['ascend', 'descend', 'ascend'],
      showSorterTooltip: false,
      defaultSortOrder: 'ascend',
    }, {
      title: 'Finaliza',
      dataIndex: 'endAt',
      key: 'endAt',
      render: (date: dayjs.Dayjs) => date ? dayjs(date).format('DD [de] MMMM [del] YYYY') : '--',
      sorter: (a, b) => {
        // TODO: Understand why this is working
        if (a.endAt === null) return 1
        if (b.endAt === null) return -1

        return dayjs(a.endAt).isBefore(dayjs(b.endAt)) ? 1 : -1
      },
      sortDirections: ['ascend', 'descend', 'ascend'],
      showSorterTooltip: false,
      defaultSortOrder: 'ascend',
    },
    {
      title: 'Sede',
      dataIndex: ['branchOffice', 'nickname'],
      key: 'branchOffice',
      sorter: (a, b) => a.branchOffice.nickname.localeCompare(b.branchOffice.nickname),
      sortDirections: ['ascend', 'descend', 'ascend'],
      showSorterTooltip: false,
      defaultSortOrder: 'ascend',
    },
    {
      title: 'Comentario',
      dataIndex: 'comment',
      key: 'comment',
      sorter: (a, b) => a.comment.localeCompare(b.comment),
      sortDirections: ['ascend', 'descend', 'ascend'],
      showSorterTooltip: false,
      defaultSortOrder: 'ascend',
    }
    , {
      title: 'Acciones',
      key: 'actions',
      render: (_: any, letter: IInactivityLetter) => (
        <Space size="middle">
          <Button onClick={() => handleOpenModalForEdit(letter.id)}>Editar</Button>
          <Button danger onClick={() => handleDelete(letter.id)}>
            Eliminar
          </Button>
          {/* <Button type='link'>Comprobante</Button> */}
        </Space>
      ),
    },
  ]

  useEffect(() => {
    loadInactivityPeriods()
  }, [])

  return (
    <Flex vertical gap={16}>
      <Flex justify="end">
        <Button icon={<PlusOutlined />}	onClick={() => {
          setShowEditForm(true)
        }}>
          Agregar Carta
        </Button>
      </Flex>
      <Table 
        columns={columns} 
        dataSource={periods}
        virtual
        // style={{ overflow: 'auto' }}
      />
      <InactivityLetterEditModal 
        open={showEditForm}
        onCancel={handleCancelModal}
        onNew={handleNew}
        onEdit={handleEdit}
        inactivityLetter={selectedPeriod}
        branchOffices={branchOffices}

      />
        
    </Flex>)
}

function InactivityLetterEditModal(
  { 
      inactivityLetter,
      branchOffices,
      onNew, 
      onEdit,
      onCancel,
      open,
  }
  : { 
      inactivityLetter?: IInactivityLetter,
      branchOffices: BranchOffice[],
      onNew: (id: number, settlement: ISettlement) => void, 
      onEdit: (id: number, settlement: ISettlement) => void,
      onCancel: () => void,
      open: boolean,

  }
) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const {userAuth} = useAuthentication()
  console.log({userAuth})
  const userPerson = userAuth?.user?.person
  const fullName = userPerson?.firstName + ' ' + userPerson?.lastName

  const isEditing = !!inactivityLetter;

  if (!userPerson) {
      console.error("User don't have a contact data asigned");
      message.error('El usuario no tiene datos de contacto asignados');
      onCancel();
  }

  const handleOk = () => {
      form.validateFields()
          .then(async (values) => {
              
              if (values.startAt >= values.endAt) {
                  message.error('La fecha de inicio debe ser antes de la fecha de fin');
                  return;
              }
              
              try {
                  if (isEditing) {
                      await onEdit(inactivityLetter.id, {
                          ...inactivityLetter,
                          ...values,
                          
                      });
                  } else {
                      await onNew({
                          ...values,
                          
                      });
                  }

                  form.resetFields();
              } catch (error) {
                  message.error(error.message);
                  console.log({ error });
              } finally {
                  setLoading(false);
              }
          })
          .catch((error) => {
              console.log({ error });
          });
  }

  function handleCancelModal() {
      form.resetFields();
      onCancel();
  }

  useEffect(() => {

    if (inactivityLetter) {
      form.setFieldsValue({
        ...inactivityLetter,
        startAt: dayjs(inactivityLetter?.startAt),
        endAt: dayjs(inactivityLetter?.endAt),
        comment: inactivityLetter?.comment
      })
    }

    
  }, [inactivityLetter])

  const selectOptions = branchOffices.map((office) => ({
    value: office.id,
    label: `${office.nickname} - ${office.address}`, 
  }));

  return (
      <Modal
          title={isEditing ? 'Editar Carta de Inactividad' : 'Nueva Cara de Inactividad'}
          open={open}
          onOk={handleOk}
          confirmLoading={loading}
          onCancel={handleCancelModal}
      >
          <Form 
            layout="vertical" form={form}
          >
            {branchOffices.length > 0 && (
              <Form.Item name="branchOfficeId" label="Sede">
                <Select options={selectOptions}/>
              </Form.Item>
            )}
            
            <Form.Item
                label="Inicio del periodo de inactividad"
                name="startAt"
                rules={[{ required: true }]}
            >
                <DatePicker />
            </Form.Item>
            <Form.Item
                label="Fin del periodo de inactividad"
                name="endAt"
            >
                <DatePicker />
            </Form.Item>
            <Form.Item
                label="Comentarios"
                name="comment"
                rules={[{ required: true }]}
            >
                <Input.TextArea />
            </Form.Item>
          </Form>
      </Modal>
  );
}


function BranchOfficesDisplay({ branchOffices, onEdit, onDelete, onNew }): JSX.Element {

  const [isDeleteOfficeModalOpen, setIsDeleteOfficeModal] = useState(false)
  const [officeToDeleteId, setOfficeToDeleteId] = useState('')


  // a function to delete office
  // it receive a office id 

  /*
      use click delete button and call a function handleOpenDeleteModal that receive
          set officeToDeleteId
          then open the modal
      
      when user select ok in delete modal
          it will call onDelete(officeToDeleteId)
          and set isDeleteOfficeModal to false        
  
  */

  function handleOpenDeleteModal(id: string) {
    setOfficeToDeleteId(id)
    setIsDeleteOfficeModal(true)
  }

  function handleDeleteOffice() {
    if (officeToDeleteId) {
      onDelete(officeToDeleteId)
      setIsDeleteOfficeModal(false)
    }
  }

  function handleCancelDeletion() {
    setOfficeToDeleteId('')
    setIsDeleteOfficeModal(false)
  }

  return (
    <>
      <Flex gap="large" align='center' justify='space-between'>
        <Title level={2}>
          Sedes
        </Title>
        <Button onClick={() => onNew()}>
          <PlusOutlined />
          Nueva
        </Button>
      </Flex>
      <Flex vertical gap="large">
        {
          branchOffices.map((office, index) => {
            // get the last fire fighter permit
            let firefighterPermit
            if (office.fireFighterDocs?.length > 0) {
              const l = office.fireFighterDocs.length
              firefighterPermit = office.fireFighterDocs[l - 1]
            }

            // get the last fire fighter permit
            let healthPermit
            if (office.healthPermitDocs?.length > 0) {
              const l = office.healthPermitDocs.length
              healthPermit = office.healthPermitDocs[l - 1]
            }

            const lastLeaseDoc = office?.leaseDocs?.length > 0 && office?.leaseDocs[office?.leaseDocs?.length - 1]
            const lastBuildingDoc = office?.buildingDocs?.length > 0 && office?.buildingDocs[office?.buildingDocs?.length - 1]

            const lastZonationDoc = office.zonations.length > 0 && office?.zonations[office?.zonations?.length - 1]

            return (
              <Flex key={office.id} vertical>

                <Flex gap={"small"} align='center' justify='space-between'>
                  <Title level={4}>{`${office.nickname} - ${office.isActive ? 'Activa' : 'Inactiva'}`}</Title>
                  <Flex gap={'small'}>
                    <Button onClick={() => onEdit(office.id)}><EditOutlined />Editar</Button>
                    <Button danger onClick={() => handleOpenDeleteModal(office.id)}><DeleteOutlined /> Eliminar</Button>
                  </Flex>
                </Flex>



                <Descriptions
                  title={`Datos Generales`}
                  bordered
                  layout='vertical'
                  items={[
                    {
                      label: 'Zona',
                      children: office.zone
                    },
                    {
                      label: 'Dirección',
                      children: office.address,
                      span: 2
                    },
                    {
                      label: 'Dimensiones',
                      children: office.dimensions + " m2"
                    },
                    {
                      label: 'Tipo de terreno',
                      children: office.type
                    },
                    {
                      label: 'Procedencia',
                      children: office.isRented
                        ? (
                          <>
                            Alquilado
                          </>
                        )
                        : (
                          <>
                            Propio
                          </>
                        )
                    },
                    {
                      label: 'Cobrar Aseo Urbano',
                      children: office.chargeWasteCollection
                        ? (
                          <>
                            SI
                          </>
                        )
                        : (
                          <>
                            NO
                          </>
                        )
                    }
                  ]}
                />

                <Flex gap={32} wrap>

                  <Flex vertical>
                  {office.isRented
                    ? (
                      <LeaseDoc leaseDoc={lastLeaseDoc}/>
                    )
                    : (
                      <BuildingDoc buildingDoc={lastBuildingDoc}/>
                    )

                  }

                    <ZonationDoc zonations={office.zonations} lastZonationDoc={lastZonationDoc}/>
                  </Flex>

                  <Flex vertical>
                    <Permits
                      firefighterPermit={firefighterPermit}
                      healthPermit={healthPermit}
                    />
                  </Flex>

                </Flex>
                <Divider/>
              </Flex>
            )
          })
        }

      </Flex>
      <Modal title="Eliminar Contribuyente"
        data-test='business-delete-modal'
        open={isDeleteOfficeModalOpen}
        onOk={handleDeleteOffice}
        onCancel={handleCancelDeletion}>
        <p>¿Seguro que deseas eliminar esta sede?</p>
      </Modal>
    </>
  )
}

function LeaseDoc({ leaseDoc }) {
  let lastLeaseDoc = leaseDoc
  return (
    <>
                        <Title level={5}>
                          Contrato de Arrendamiento 
                        </Title>
                        <Paragraph>
                          {
                            lastLeaseDoc
                              ? (
                                <>
                                  <Badge
                                    status={new Date(lastLeaseDoc?.expirationDate) > new Date() ? "success" : "error"}
                                    text={new Date(lastLeaseDoc?.expirationDate).toLocaleDateString()}
                                  />
                                  {
                                    lastLeaseDoc?.docImages.map(image => {
                                      return (
                                        <div key={image.id}>
                                          <a

                                            target="_blank"
                                            href={api.completeUrl(image.url)}> Pagina #{image.pageNumber}
                                          </a>
                                        </div>
                                      )
                                    })
                                  }
                                </>
                              )
                              : (
                                <>No registrado</>
                              )
                          }
                        </Paragraph>
                      </>
  )
}

function BuildingDoc({ buildingDoc }) {
  let lastBuildingDoc = buildingDoc
  return (<>
    <Title level={5}>
      Contrato de propiedad
    </Title>
    <Paragraph>
      {
        lastBuildingDoc
          ? (
            <>
              Expira: {new Date(lastBuildingDoc?.expirationDate).toLocaleDateString()}
              {
                lastBuildingDoc?.docImages.map(image => {
                  return (
                    <div key={image.id}>
                      <a

                        target="_blank"
                        href={api.completeUrl(image.url)}> Pagina #{image.pageNumber}
                      </a>
                    </div>
                  )
                })
              }
            </>
          )
          : (
            <>No registrado</>
          )
      }
    </Paragraph>
  </>)
}
function ZonationDoc({zonations, lastZonationDoc}) {
  return (
    <>
      <Title level={5}>
                    Zonificación
                  </Title>
                  {
                    (lastZonationDoc)
                      ? (
                        <Paragraph>
                          {zonations[zonations.length - 1].docImages.map(image => {
                            return (
                              <div key={image.id}>
                                <a
                                  target="_blank"
                                  href={api.completeUrl(image.url)}> Pagina #{image.pageNumber}</a><br />
                              </div>)
                          })}

                        </Paragraph>
                      )
                      : (
                        <Paragraph>
                          No registrada
                        </Paragraph>
                      )
                  }
      </>
  )
}

function CommunicationDisplay({
  business
}: {
  business: Business
}) {
  function getCommunicationPreference(business: Business) {
    let communicationPreference = {
      preferredContact: '',
      preferredChannel: '',
      sendCalculosTo: ''
    };

    if (!business) {
      return communicationPreference
    }


    // Set preferred contact
    switch (business.preferredContact) {
      case "OWNER":
        communicationPreference.preferredContact = "Propietario";
        break;
      case "ACCOUNTANT":
        communicationPreference.preferredContact = "Contador";
        break;
      case "ADMIN":
        communicationPreference.preferredContact = "Administrador";
        break;
      default:
        communicationPreference.preferredContact = "Desconocido";
    }

    // Set preferred channel
    switch (business.preferredChannel) {
      case "PHONE":
        if (business.preferredContact === "OWNER") {
          communicationPreference.preferredChannel = business.owner.phone;
        } else if (business.preferredContact === "ACCOUNTANT") {
          communicationPreference.preferredChannel = business?.accountant?.phone;
        } else if (business.preferredContact === "ADMIN") {
          communicationPreference.preferredChannel = business?.administrator?.phone;
        }
        break;
      case "WHATSAPP":
        // console.log("NOTA: El contacto quiere whatsapp")
        if (business.preferredContact === "OWNER") {
          // console.log("NOTA: El contacto ES PROPIETARIO")
          communicationPreference.preferredChannel = business.owner.whatsapp;
        } else if (business.preferredContact === "ACCOUNTANT") {
          communicationPreference.preferredChannel = business?.accountant?.whatsapp;
        } else if (business.preferredContact === "ADMIN") {
          communicationPreference.preferredChannel = business?.administrator?.whatsapp;
        }
        break;
      case "EMAIL":
        if (business.preferredContact === "OWNER") {
          communicationPreference.preferredChannel = business.owner.email;
        } else if (business.preferredContact === "ACCOUNTANT") {
          communicationPreference.preferredChannel = business.accountant.email;
        } else if (business.preferredContact === "ADMIN") {
          communicationPreference.preferredChannel = business.administrator.email;
        }
        break;
      default:
        communicationPreference.preferredChannel = "Desconocido";
    }

    // Set sendCalculosTo
    switch (business.sendCalculosTo) {
      case "PHONE":
        if (business.preferredContact === "OWNER" && business.owner) {
          communicationPreference.sendCalculosTo = business.owner.phone;
        } else if (business.preferredContact === "ACCOUNTANT") {
          communicationPreference.sendCalculosTo = business?.accountant?.phone;
        } else if (business.preferredContact === "ADMIN") {
          communicationPreference.sendCalculosTo = business?.administrator?.phone;
        }
        break;
      case "WHATSAPP":
        if (business.preferredContact === "OWNER") {
          communicationPreference.sendCalculosTo = business.owner.whatsapp;
        } else if (business.preferredContact === "ACCOUNTANT") {
          communicationPreference.sendCalculosTo = business.accountant.whatsapp;
        } else if (business.preferredContact === "ADMIN") {
          communicationPreference.sendCalculosTo = business.administrator.whatsapp;
        }
        break;
      case "EMAIL":
        if (business.preferredContact === "OWNER") {
          communicationPreference.sendCalculosTo = business.owner.email;
        } else if (business.preferredContact === "ACCOUNTANT" && business.accountant) {
          communicationPreference.sendCalculosTo = business.accountant.email;
        } else if (business.preferredContact === "ADMIN" && business.administrator) {
          communicationPreference.sendCalculosTo = business.administrator.email;
        }
        break;
      default:
        communicationPreference.sendCalculosTo = "Desconocido";
    }
    return communicationPreference;
  }

  const preference = getCommunicationPreference(business)

  function getPreferredChannelName(business: Business): String {
    const mapper: { [key: string]: string } = {
      "WHATSAPP": "Whatsapp",
      "PHONE": "Teléfono",
      "EMAIL": "Correo"
    }

    if (!business?.preferredChannel) {
      return ''
    }
    return mapper[business?.preferredChannel]
  }


  return <Flex vertical gap={'middle'}>
      {/* <Title level={3}>
        Encargados
      </Title> */}

      <ContactPreferenceDescription
        preference={{
          preferredContact: preference.preferredContact,
          preferredChannel: preference.preferredChannel,
          sendCalculosTo: preference.sendCalculosTo,
          reminderInterval: business.reminderInterval && reminderIntervalMap[business.reminderInterval],
          preferredChannelType: getPreferredChannelName(business)
        }}
      />

      <Flex gap='middle' wrap style={{ overflow: 'auto' }}>
        {
          business.owner && (
            <ContactDisplay
              contact={business.owner}
              role={"Propietario"}
            />
          )
        }

        {business.accountant && (
          <ContactDisplay
            contact={business.accountant}
            role={"Contador"}
          />
        )}

        {business.administrator && (
          <ContactDisplay
            contact={business.administrator}
            role={"Administrador"}
          />
        )}
      </Flex>
    </Flex>
}

function ContactDisplay({ contact, role }): JSX.Element {
  const { businessId } = useParams()
  const navigate = useNavigate()
  //  /contacts/1
  return (
    <Card
      title={role + ": " + contact.firstName + " " + contact.lastName}
      extra={<Flex gap={'middle'}>
        <Link to={`/contacts/${contact.id}`}>
          Ver más
        </Link>
        <Link to={`/contacts/${contact.id}/edit?redirect=/business/${businessId}`}>
          Editar
        </Link>
      </Flex>
      }

      style={{ maxWidth: 400 }}
    >
      {contact?.firstName
        ? (
          <Flex gap={'middle'}>
            <Image
              data-test="business-details-owner-pfp"
              width={150}
              src={contact?.profilePictureUrl ? 
                completeUrl(contact?.profilePictureUrl)
                : '/public/images/default_user.webp'}
            />
            <Paragraph>
              Cédula: {contact.dni}<br />
              Teléfono: {contact.phone}<br />
              Whatsapp: {contact.whatsapp}<br />
              Correo: {contact.email}<br />
            </Paragraph>
          </Flex>
        ) : (
          <Paragraph>
            Sin datos
          </Paragraph>
        )}
    </Card>
  )
}

function ContactPreferenceDescription({ preference }): JSX.Element {

  if (!preference) {
    return <p>Actividad Económica no registrada</p>
  }

  let { preferredContact,
    preferredChannel,
    sendCalculosTo,
    reminderInterval,
    preferredChannelType } = preference
  const contactPreferenceDescriptions = [
    {
      key: '1',
      label: 'Contacto',
      children: preferredContact
    },
    {
      key: '2',
      label: 'Comunicados al',
      children: preferredChannel + ` (${preferredChannelType})`
    },
    {
      key: '3',
      label: 'Enviar Cálculos al',
      children: sendCalculosTo,
    },
    {
      key: '4',
      label: 'Recordar',
      children: reminderInterval
    },
  ]

  return (
    <Descriptions
      layout='vertical'
      title="Preferencias de Comunicación"
      bordered
      items={contactPreferenceDescriptions}
    />

  )
}

function Permits({ firefighterPermit, healthPermit }): JSX.Element {

  return (
    <>
      {/* <Title level={4}>Permisos</Title> */}
      {firefighterPermit
        ? (<PermitRender data={firefighterPermit} title={"Permiso de Bomberos"} />)
        : <Paragraph>No hay permiso de bomberos registrado</Paragraph>
      }

      {healthPermit
        ? (<PermitRender data={healthPermit} title={"Permiso de Sanidad"} />)
        : <Paragraph>No hay permiso de sanidad registrado</Paragraph>
      }

    </>
  )
}

function PermitRender({ data, title }) {
  const expirationDate = new Date(data.expirationDate)
  return (
    <>
      <Title level={5}>
        {title}
      </Title>
      <Paragraph>
        <Badge
          status={expirationDate > new Date() ? "success" : "error"}
          text={expirationDate.toLocaleDateString()}
        />
        {
          data.docImages?.map(image => {
            return (
              <div key={image.id}>
                <a
                  target="_blank"
                  href={api.completeUrl(image.url)}> Pagina #{image.pageNumber}
                </a><br />
              </div>
            )
          })
        }
      </Paragraph>
    </>
  )
}

function GeneralInformationDescription({ business }): JSX.Element {
  if (!business) { return <></> }

  const generalInformationDescriptions = [
    {
      key: '1',
      label: "RIF",
      children: business?.dni,
      span: 2
    },
    {
      key: '2',
      label: "Fecha de constitución",
      children: business?.companyIncorporationDate 
        ? new Date(business?.companyIncorporationDate).toLocaleDateString() 
        : "-",
      span: 2
    },
    {
      key: '3',
      label: "Fecha de vencimiento",
      children: <>
        <Badge
          status={new Date(business?.companyExpirationDate) > new Date() 
            ? "success" : "error"}
          text={business?.companyExpirationDate 
            ? new Date(business?.companyExpirationDate).toLocaleDateString() 
            : "-"}
        />
      </>

      ,
      span: 2
    },
    {
      key: '4',
      label: "Fecha de vencimiento de la junta directiva",
      children: <>
        <Badge
          status={new Date(business?.directorsBoardExpirationDate) > new Date() 
            ? "success" : "error"}
          text={business?.directorsBoardExpirationDate 
            ? new Date(business?.directorsBoardExpirationDate)
              .toLocaleDateString() 
            : "-"}
        />
      </>
      ,
      span: 2
    },
    {
      key: '5',
      label: 'Categoría',
      children: business?.businessActivityCategory?.name,
    }, 
    {
      key: '6',
      label: "Fiscal Asignado",
      children: business?.fiscal?.person 
        ? business?.fiscal?.person.firstName + " " + business?.fiscal?.person.lastName 
        : business?.fiscal?.username ?? "No registrado",
      span: 2
    },
    {
      key: '7',
      label: 'Indice en el archivo de liquidaciones',
      children: business.settlementArchiveIndex ?? "No registrado",
    },
    {
      key: '8',
      label: 'Indice en el archivo de cuentas por cobrar',
      children: business.pendingArchiveIndex ?? "No registrado",
    }
  ]

  const coi = business.certificateOfIncorporations?.length > 0 && business.certificateOfIncorporations[business.certificateOfIncorporations.length - 1]

  console.log({coi})

  return (
    <Flex vertical>
      <Descriptions
        title="Información General"
        bordered
        items={generalInformationDescriptions}
        layout='vertical'
      />

      {/* coi */}
      <Typography.Title level={5}>
        Registro de Comercio
      </Typography.Title>
      {
        coi
          ? (
            <Paragraph>
              {coi.docImages?.map(image => {
                return (
                  <div key={image.id}>
                    <a
                      target="_blank"
                      href={api.completeUrl(image.url)}> Pagina #{image.pageNumber}</a><br />
                  </div>)
              })}

            </Paragraph>
          )
          : (
            <Paragraph>
              No registrado
            </Paragraph>
          )
      }
    </Flex>
  )
}

function EconomicActivityDescription({ economicActivity }: { economicActivity: EconomicActivity }): JSX.Element {

  if (!economicActivity) {
    return <p>Actividad Económica no registrada</p>
  }

  console.log({ economicActivity })

  let { title, code, currentAlicuota } = economicActivity
  const economicActivityDescriptions = [
    {
      key: '1',
      label: 'Código',
      children: code
    },
    {
      key: '2',
      label: 'Ramo',
      children: title
    },
    {
      key: '3',
      label: 'Alicuota',
      children: percentHandler((currentAlicuota?.taxPercent ?? 0))
        .multiply(100).format(),
    },
    {
      key: '4',
      label: 'Mínimo Tributario',
      children: CurrencyHandler((currentAlicuota?.minTaxMMV ?? 0))
        .format() + " TCMMV-BCV"
    },
  ]

  return (
    <Descriptions
      title="Actividad Económica"
      bordered
      items={economicActivityDescriptions}
    />

  )
}

function EconomicLicensesTab({ 
  licenseStatus, 
  onUpdate, 
  businessId,
  // economicLicenses 
}) {

  // let handleNewEconomicLicense = onUpdate
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedEconomicLicense, setSelectedEconomicLicense] = useState<EconomicLicense | null>(null)
  const { userAuth } = useAuthentication()


  // const dummyData = [
  //   {
  //     id: 1,
  //     businessId: 1,
  //     invoice: { isPaid: false },
  //     issuedDate: null,
  //     expirationDate: null,
  //   },
  //   {
  //     id: 2,
  //     businessId: 1,
  //     invoice: { isPaid: true },
  //     issuedDate: dayjs("2022-01-01"),
  //     expirationDate: null,
  //   },
  //   {
  //     id: 3,
  //     businessId: 1,
  //     invoice: { isPaid: true },
  //     issuedDate: dayjs("2022-01-01"),
  //     expirationDate: dayjs("2022-06-01"),
  //   },
  //   {
  //     id: 4,
  //     businessId: 1,
  //     invoice: { isPaid: true },
  //     issuedDate: dayjs("2022-01-01"),
  //     expirationDate: dayjs("2021-06-01"),
  //   },
  // ]

  const [economicLicenses, setEconomicLicenses] = useState<EconomicLicense[]>([])

  const handleShowNewEconomicLicenseModal = () => {
    setShowEditModal(true)
  }

  const handleShowModalToEditEconomicLicense = (licenseId: number) => {
    console.log(`Edit economic license with ID: ${licenseId}`);
    // Add your logic to edit the economic license here

    setSelectedEconomicLicense(economicLicenses.find(license => license.id === licenseId));
    setShowEditModal(true);
  };

  const handleNewEconomicLicense = async (license: EconomicLicense) => {
    try {
      console.log({license})

      const economicLicenseToCreate = {
        ...license,
        businessId,
        openAt: dayjs(license.openAt).format('HH:mm:ss'),
        closeAt: dayjs(license.closedAt).format('HH:mm:ss'),
        createdByUserId: userAuth.user.id,
        checkedByUserId: userAuth.user.id,
      }

      console.log({economicLicenseToCreate})

      let createdEconomicLicense = await economicLicenseApi.create(economicLicenseToCreate, {
        token: userAuth?.token
      })

      loadEconomicLicenses(businessId)

      setShowEditModal(false)

    } catch (err) {
      console.error(err)
    }
  }
  const handleEditEconomicLicense = async (licenseId: number, license: EconomicLicense) => {
    try {
      console.log({licenseId, license})
      // implement your edit logic here
      let economicLicenseToEdit = {
        ...license,
        openAt: dayjs(license.openAt).format('HH:mm:ss'),
        closeAt: dayjs(license.closedAt).format('HH:mm:ss'),

      }

      let editedEconomicLicense = await economicLicenseApi.update(licenseId, economicLicenseToEdit, {
        token: userAuth?.token
      })

      loadEconomicLicenses(businessId)
      setShowEditModal(false)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteEconomicLicense = async (licenseId: number) => {
    try {
      console.log(`Delete economic license with ID: ${licenseId}`);
      // Add your logic to delete the economic license here
      await economicLicenseApi.deleteById(licenseId, {
        token: userAuth?.token
      })

      loadEconomicLicenses(businessId)
    } catch (error) {
      console.error(`Failed to delete economic license with ID: ${licenseId}`, error);
    }
  };

  const handleCancelModal = () => {
    setSelectedEconomicLicense(null);
    setShowEditModal(false);
  };

  const loadEconomicLicenses = async (businessId) => {
    try {
      let economicLicenses = await economicLicenseApi.findAll({
        filters: {
          businessId
        },
        token: userAuth?.token
      })
      setEconomicLicenses(economicLicenses)

    } catch (err) {
      console.log({ err })
    }
  }

  useEffect(() => {
    loadEconomicLicenses(businessId)
  }, [businessId])

  return <div>

    {/* Deactivated while i work on the gross income feature */}
    
    {/* <Typography.Title level={3}>
        Licencia De Actividad Economica
    </Typography.Title> */}
    <Flex vertical gap={16}>
        {/* Disabled for now in order to facilitate the process to add business data */}
        {/* { licenseStatus?.isValid 
        ? (
            <Flex vertical>
                <Paragraph>El Contribuyente es apto para una licencia de actividad economica</Paragraph>
                <Button
                    onClick={() => handleNewEconomicLicense()}
                >Otorgar Licencia</Button>
            </Flex>
        ) : (
            <>
                <List 
                    bordered
                    header={<strong>El contribuyente no es apto para la licencia de actividad económica por las siguientes razones:</strong>}
                    dataSource={licenseStatus?.error?.fields}
                    renderItem={
                        (field) => <List.Item>{field.message}</List.Item>
                    }
                />
            </>
        )} */}

      <Flex justify="end">
        <Button 
          icon={<PlusOutlined />}	
          onClick={handleShowNewEconomicLicenseModal}
        >
          Agregar Licencia
        </Button>
      </Flex>
      <EconomicLicensesTable 
        economicLicenses={economicLicenses}

        onEdit={handleShowModalToEditEconomicLicense}
        onDelete={handleDeleteEconomicLicense}
        
      />
    </Flex>    

    <EconomicLicenseEditModal
      economicLicense={selectedEconomicLicense}

      open={showEditModal}
      onCancel={handleCancelModal}
      onNew={handleNewEconomicLicense}
      onEdit={handleEditEconomicLicense}
      
    />
  </div>
}

// a component to display the economic licenses table
function EconomicLicensesTable({ economicLicenses, onEdit, onDelete }): JSX.Element {
  const navigate = useNavigate()
  console.log({ economicLicenses })

  const columns = [
    // {
    //   title: 'Estado',
    //   dataIndex: '',
    //   render: (text: any, record: any) => {
    //     return (
    //       <Badge
    //         status={record.invoice?.isPaid ? "success" : "error"}
    //         text={
    //           (() => {
    //             const now = new Date();
    //             if (!record.invoice?.isPaid) {
    //               return "Por pagar";
    //             } else if (!record.issuedDate) {
    //               return "Por activar";
    //             } else if (record.expirationDate && new Date(record.expirationDate) > now) {
    //               return "Activo";
    //             } else if (record.expirationDate) {
    //               const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    //               return new Date(record.expirationDate) > threeMonthsAgo ? "Por renovar" : "Vencido";
    //             }
    //             return "Estado desconocido";
    //           })()
    //         }
    //       />
    //     );
    //   }
    // },
    {
      title: 'Fecha de emisión',
      dataIndex: 'issuedDate',
      sorter: (a: any, b: any) => dayjs(a.issuedDate).unix() - dayjs(b.issuedDate).unix(),
      sortDirections: ['ascend', 'descend', 'ascend'],
      render: (issuedDate: any) => {
        return issuedDate ? dayjs(issuedDate).locale('es').format('DD/MM/YYYY') : "-"
      },
      showSorterTooltip: false,
    },
    {
      title: 'Fecha de vencimiento',
      dataIndex: 'expirationDate',
      sorter: (a: any, b: any) => dayjs(a.expirationDate).unix() - dayjs(b.expirationDate).unix(),
      sortDirections: ['ascend', 'descend', 'ascend'],
      render: (expirationDate: any) => {
        return expirationDate ? dayjs(expirationDate).locale('es').format('DD/MM/YYYY') : "-"
      },
      showSorterTooltip: false,
    },
    {
      title: "Es Inscripción",
      dataIndex: "isRegistration",
      render: (value: boolean) => value ? "NO" : "SI"
    },
    {
      title: 'Acciones',
      dataIndex: '',
      render: (record: any) => {
        return (
          <Flex gap={16}>
            <Button onClick={() => onEdit(record.id)}>Editar</Button>
            <Popconfirm
              title="¿Estás seguro de eliminar la licencia?"
              onConfirm={() => onDelete(record.id)}
              okText="Sí"
              cancelText="No"
            >
              <Button danger>
                Eliminar
              </Button>
            </Popconfirm>
          </Flex>
        )
      }
    }
  ]
  return (
    <Table 
      dataSource={economicLicenses} 
      columns={columns}
      rowKey={(r) => r.id} 
      style={{ overflow: "auto"}}
    />
  )
}


interface EconomicLicenseEditModalProps {
  economicLicense: EconomicLicense | null;
  open: boolean;
  onCancel: () => void;
  onNew: (license: EconomicLicense) => void;
  onEdit: (id: number, license: EconomicLicense) => void;
}

const EconomicLicenseEditModal: React.FC<EconomicLicenseEditModalProps> = ({
  economicLicense,
  open,
  onCancel,
  onNew,
  onEdit,
}) => {
  const [form] = Form.useForm();

  const handleSubmit = () => {
    form.validateFields().then(values => {
      if (economicLicense) {
        onEdit(economicLicense.id, {
          ...values
        });
      } else {
        onNew({
          ...values
        });
      }
      
      resetForm()
    });
  };

  function resetForm() {
    console.log("resetting form")
    form.setFieldsValue({
      issuedDate: null,
      expirationDate: null,
      openAt: dayjs().set('hour', 7).set('minute', 0).set('second', 0),
      closeAt: dayjs().set('hour', 19).set('minute', 0).set('second', 0),
    })
  }

  function handleCancelModal() {
    resetForm();
    onCancel();
  }

  useEffect(()=>{
    console.log({economicLicense})
    if (economicLicense) {
      form.setFieldsValue({

        ...economicLicense,

        issuedDate: dayjs(economicLicense.issuedDate),
        expirationDate: dayjs(economicLicense.expirationDate),
        openAt: dayjs(economicLicense.openAt),
        closeAt: dayjs(economicLicense.closeAt),
      });
    } else {
      resetForm()
    }
  }, [economicLicense])

  return (
    <Modal
      title={`${economicLicense ? 'Editando ' : 'Nueva '} Licencia de Actividad Económica`}
      open={open}
      onCancel={handleCancelModal}
      footer={[
        <Button key="back" onClick={handleCancelModal}>
          Cancelar
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          {economicLicense ? 'Guardar' : 'Crear'}
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" initialValues={economicLicense}>
        <Flex gap={16}>
          <Form.Item name="issuedDate" label="Inicia" style={{ flex: 1 }} rules={[{ required: true, message: "Introduzca la fecha de inicio" }]}> 
            <DatePicker />
          </Form.Item>
          <Form.Item name="expirationDate" label="Expira" style={{ flex: 1 }} rules={[{ required: true, message: "Introduzca la fecha de vencimiento" }]}> 
            <DatePicker />
          </Form.Item>
        </Flex>
        <Flex gap={16}>
          <Form.Item name="openAt" label="Abre a las" style={{ flex: 1 }} rules={[{ required: true, message: "Introduzca la hora de apertura" }]}> 
            <TimePicker/>
          </Form.Item>
          <Form.Item name="closeAt" label="Cierra a las" style={{ flex: 1 }} rules={[{ required: true, message: "Introduzca la hora de cierre" }]}> 
            <TimePicker/>
          </Form.Item>
        </Flex>
        <Form.Item name="isRegistration" label="Es Inscripción">
          <Switch checkedChildren="SI" unCheckedChildren="NO" defaultChecked />
        </Form.Item>
      </Form>
    </Modal>
  );
};
