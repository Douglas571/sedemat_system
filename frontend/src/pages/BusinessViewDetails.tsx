import React, { Children, useEffect, useState } from 'react'
import { Badge, Card, Descriptions, Divider, FormProps, List, Modal, Space } from 'antd'
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
  DatePicker
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

import { completeUrl } from './BusinessShared';

import useAuthentication from '../hooks/useAuthentication';


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
    const licenses = await economicLicenseApi.findAll()
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
      await api.deleteBranchOffice(id)

      loadBusinessData()
    } catch (error) {
      console.log({ error })
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
      children: CommunicationDisplay({
        business
      })
    },
    {
      label: 'Cartas de Inactividad',
      key: 'inactivity-letters',
      children: <InactivityLettersDisplay/>
    }
  ]

  return (
    <Card
      title={
        <Flex align='center' wrap style={{ marginBottom: '20px' }} justify='space-between'>
          <Title style={{ marginRight: '20px' }}>
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
      <Tabs defaultActiveKey="general" items={tabsItems} />

        {/* 
          <div>

                Deactivated while i work on the gross income feature
                
                <Typography.Title level={3}>
                    Licencia De Actividad Economica
                </Typography.Title>
                <Flex>
                    { licenseStatus?.isValid 
                    ? (
                        <Flex vertical>
                            <Paragraph>El Contribuyente es apto para una licencia de actividad económica</Paragraph>
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
                    )}
                </Flex>

                <EconomicLicensesTable economicLicenses={economicLicenses}/>
            </div>
        */}        

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

function InactivityLettersDisplay({}): JSX.Element {

  const letters: IInactivityLetter[] = [
    {
      id: 1,
      startAt: dayjs('2022-01-01'), // Fecha de inicio del periodo de inactividad
      endAt: dayjs('2022-01-31'), // Fecha de fin del periodo de inactividad
      branchOfficeId: 1, // ID de la sucursal
      branchOffice: {
        id: 1,
        nickname: 'Sucursal Principal', // Apodo de la sucursal
        type: 'Propio', // Tipo de sucursal
        address: 'Calle 1, entre Calle 2 y Calle 3, Zamora, Venezuela', // Dirección de la sucursal
        contact: {
          id: 1,
          firstName: 'Juan', // Nombre del contacto
          lastName: 'Pérez', // Apellido del contacto
          phone: '0412-1234567', // Teléfono del contacto
          email: 'juan.perez@example.com' // Correo electrónico del contacto
        }
      },
      comment: 'Comentario para la inactividad 1' // Comentario sobre la carta de inactividad
    },
    {
      id: 2,
      startAt: dayjs('2022-02-01'),
      endAt: dayjs('2022-02-28'),
      branchOfficeId: 2,
      branchOffice: {
        id: 2,
        nickname: 'Sucursal 2',
        type: 'Alquilado',
        address: 'Avenida 1, entre Avenida 2 y Avenida 3, Zamora, Venezuela',
        contact: {
          id: 2,
          firstName: 'María',
          lastName: 'González',
          phone: '0414-1234567',
          email: 'maria.gonzalez@example.com'
        }
      },
      comment: 'Comentario para la inactividad 2'
    },
    {
      id: 3,
      startAt: dayjs('2022-03-01'),
      endAt: null, // Periodo de inactividad aún en curso
      branchOfficeId: 1,
      branchOffice: {
        id: 1,
        nickname: 'Sucursal Principal',
        type: 'Propio',
        address: 'Calle 1, entre Calle 2 y Calle 3, Zamora, Venezuela',
        contact: {
          id: 1,
          firstName: 'Juan',
          lastName: 'Pérez',
          phone: '0412-1234567',
          email: 'juan.perez@example.com'
        }
      },
      comment: 'Comentario para la inactividad 3'
    }
  ]

  const [showEditForm, setShowEditForm] = useState(false)
  const [selectedLetter, setSelectedLetter] = useState<IInactivityLetter | null>(null)

  function handleNew(newLetter: IInactivityLetter){
    
    setShowEditForm(false)
  }

  
  function handleEdit(id: number){
    // implement logic here

    setSelectedLetter(null)
    setShowEditForm(false)
  }

  function handleDelete(id: number){
    // implement logic here
  }

  function handleCancelModal() {

    setSelectedLetter(null)
    setShowEditForm(false)
  }

  function handleOpenModalForEdit(letterId: number) {

    const selectedLetter = letters.find(letter => letter.id === letterId)

    if (selectedLetter) {
      setSelectedLetter(selectedLetter)
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
      render: (date: dayjs.Dayjs) => dayjs(date).format('DD/MM/YYYY'),
      sorter: (a, b) => a.startAt.unix() - b.startAt.unix(),
      sortDirections: ['ascend', 'descend', 'ascend'],
      showSorterTooltip: false,
      defaultSortOrder: 'ascend',
    }, {
      title: 'Finaliza',
      dataIndex: 'endAt',
      key: 'endAt',
      render: (date: dayjs.Dayjs) => date ? dayjs(date).format('DD/MM/YYYY') : '--',
      sorter: (a, b) => {
        // TODO: Understand why this is working
        if (a.endAt === null) return 1
        if (b.endAt === null) return -1

        return a.endAt.unix() - b.endAt.unix()
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
    , {
      title: 'Acciones',
      key: 'actions',
      render: (_: any, letter: IInactivityLetter) => (
        <Space size="middle">
          <Button onClick={() => handleOpenModalForEdit(letter.id)}>Editar</Button>
          <Button danger onClick={() => handleDelete(letter.id)}>
            Eliminar
          </Button>
          <Button type='link'>Comprobante</Button>
        </Space>
      ),
    },
  ]

  return (
    <Flex vertical gap={16}>
      <Flex justify="end">
        <Button icon={<PlusOutlined />}	onClick={() => {
          setShowEditForm(true)
        }}>
          Agregar Carta
        </Button>
      </Flex>
      <Table columns={columns} dataSource={letters}/>
      <InactivityLetterEditModal 
        open={showEditForm}
        onCancel={handleCancelModal}
        onNew={handleNew}
        onEdit={handleEdit}
        inactivityLetter={selectedLetter}

      />
        
    </Flex>)
}

function InactivityLetterEditModal(
  { 
      inactivityLetter,
      onNew, 
      onEdit,
      onCancel,
      open,
  }
  : { 
      inactivityLetter?: IInactivityLetter,
      onNew: (settlement: ISettlement) => void, 
      onEdit: (settlement: ISettlement) => void,
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
              setLoading(true);
              try {
                  if (isEditing) {
                      await onEdit({
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
    form.setFieldsValue({
      ...inactivityLetter
    })
  })

  return (
      <Modal
          title={isEditing ? 'Editar Carta de Inactividad' : 'Nueva Cara de Inactividad'}
          open={open}
          onOk={handleOk}
          confirmLoading={loading}
          onCancel={handleCancelModal}
      >
          <Form layout="vertical" form={form}>
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
      <Title level={3}>
        Encargados
      </Title>

      <ContactPreferenceDescription
        preference={{
          preferredContact: preference.preferredContact,
          preferredChannel: preference.preferredChannel,
          sendCalculosTo: preference.sendCalculosTo,
          reminderInterval: business.reminderInterval && reminderIntervalMap[business.reminderInterval],
          preferredChannelType: getPreferredChannelName(business)
        }}
      />

      <Flex gap='middle' wrap>
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
              src={completeUrl(contact.profilePictureUrl)}
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
      label: 'Recordad',
      children: reminderInterval
    },
  ]

  return (
    <Descriptions
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
  ]

  const coi = business.certificateOfIncorporations?.length > 0 && business.certificateOfIncorporations[business.certificateOfIncorporations.length - 1]

  return (
    <Flex vertical>
      <Descriptions
        title="Información General"
        bordered
        items={generalInformationDescriptions}
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

// a component to display the economic licenses table
function EconomicLicensesTable({ economicLicenses }): JSX.Element {
  const navigate = useNavigate()
  console.log({ economicLicenses })

  /**
   * possible states:
   * por pagar
   *  if invoice is not paid
   * por activar
   *  if invoice is paid and issueDate is not set
   * activo
   *  issueDate is set and expirationDate is not reached
   * por renovar
   *  if expirationDate has less than 3 months of expired
   * vencido
   *  if expirationDate has more than 3 months of expired
   */

  const columns = [
    {
      title: 'Estado',
      dataIndex: '',
      render: (text: any, record: any) => {
        return (
          <Badge
            status={record.invoice?.isPaid ? "success" : "error"}
            text={
              (() => {
                const now = new Date();
                if (!record.invoice?.isPaid) {
                  return "Por pagar";
                } else if (!record.issuedDate) {
                  return "Por activar";
                } else if (record.expirationDate && new Date(record.expirationDate) > now) {
                  return "Activo";
                } else if (record.expirationDate) {
                  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
                  return new Date(record.expirationDate) > threeMonthsAgo ? "Por renovar" : "Vencido";
                }
                return "Estado desconocido";
              })()
            }
          />
        );
      }
    },
    {
      title: 'Fecha de emisión',
      dataIndex: 'issuedDate',
      render: (issuedDate: any) => {
        return issuedDate ? new Date(issuedDate).toLocaleDateString() : "-"
      }
    },
    {
      title: 'Fecha de vencimiento',
      dataIndex: 'expirationDate',
      render: (expirationDate: any) => {
        return expirationDate ? new Date(expirationDate).toLocaleDateString() : "-"
      }
    },
    {
      title: 'Acciones',
      dataIndex: '',
      render: (record: any) => {
        return (
          <Flex>
            <Button onClick={() => navigate(`/business/${record.businessId}/licenses/${record.id}/edit`)}>Actualizar</Button>
          </Flex>
        )
      }
    }
  ]
  return (
    <Table dataSource={economicLicenses} columns={columns} />
  )
}
