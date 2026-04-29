import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  LinkOutlined,
  PlusOutlined,
  SaveOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  App,
  Button,
  Card,
  Col,
  Empty,
  Form,
  Input,
  InputNumber,
  List,
  Modal,
  Popconfirm,
  Row,
  Space,
  Table,
  Typography,
  Upload,
  message,
} from 'antd';
import { useEffect, useMemo, useState } from 'react';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload/interface';
import {
  ModuleFinalTest,
  getModuleFinalTest,
  upsertModuleFinalTest,
} from '../../../services/Internship/moduleAssessments';
import { getCompactFileLabel, getCompactLinkLabel } from '../../../utils';
import { http } from '../../../utils/http';

const { Title, Text } = Typography;

const LIST_PAGE_SIZE = 3;

const pageStyles = `
  .mentor-learning-path-page .learning-path-list-shell {
    border: 1px solid #e7edf8;
    border-radius: 24px;
    overflow: hidden;
    background: #fff;
    box-shadow: 0 10px 32px rgba(15, 23, 42, 0.05);
  }

  .mentor-learning-path-page .learning-path-table .ant-table {
    background: transparent;
  }

  .mentor-learning-path-page .learning-path-table .ant-table-thead > tr > th {
    background: #fff !important;
    color: #1f2937;
    font-weight: 600;
    font-size: 15px;
    padding: 18px 24px;
    border-bottom: 1px solid #edf2f7 !important;
  }

  .mentor-learning-path-page .learning-path-table .ant-table-tbody > tr > td {
    padding: 16px 24px;
    border-bottom: 1px solid #edf2f7 !important;
    color: #334155;
    transition: background-color 0.2s ease;
  }

  .mentor-learning-path-page .learning-path-table .ant-table-tbody > tr:hover > td {
    background: #fafcff !important;
  }

  .mentor-learning-path-page .learning-path-table .learning-path-row-selected > td {
    background: #f7faff !important;
  }

  .mentor-learning-path-page .learning-path-table .ant-pagination {
    margin: 16px 0 20px !important;
  }

  .mentor-learning-path-page .learning-path-table .ant-pagination-item,
  .mentor-learning-path-page .learning-path-table .ant-pagination-prev,
  .mentor-learning-path-page .learning-path-table .ant-pagination-next {
    min-width: 32px;
    height: 32px;
    border-radius: 8px;
    border-color: #d7e0f0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .mentor-learning-path-page .learning-path-table .ant-pagination-item-active {
    border-color: #3353d8;
    background: #3353d8;
  }

  .mentor-learning-path-page .learning-path-table .ant-pagination-item-active a {
    color: #fff;
  }

`;

interface ModuleContentItem {
  id: string;
  title: string;
  type: string;
  contentUrl?: string;
  metadata?: { assessmentFileUrl?: string; documentUrls?: string[] };
}

interface LearningModuleItem {
  id: string;
  title: string;
  description?: string;
  orderIndex: number;
  contents?: ModuleContentItem[];
}

interface LearningPathItem {
  id: string;
  title: string;
  track: string;
  description?: string;
  modules?: LearningModuleItem[];
  moduleCount?: number;
}

const MOJIBAKE_PATTERN = /(?:Ã.|áº|á»|Ä.|Â|â€|Æ.)/;

const repairMojibakeLabel = (label: string): string => {
  const normalizedLabel = label.trim();

  if (!normalizedLabel || !MOJIBAKE_PATTERN.test(normalizedLabel)) {
    return normalizedLabel;
  }

  try {
    const latin1Bytes = Uint8Array.from(Array.from(normalizedLabel, (char) => char.charCodeAt(0) & 0xff));
    const decodedLabel = new TextDecoder('utf-8').decode(latin1Bytes).trim();

    return decodedLabel || normalizedLabel;
  } catch {
    return normalizedLabel;
  }
};

const getTrainingDisplayFileLabel = (resourceUrl?: string, fallbackLabel = 'Tài liệu'): string =>
  repairMojibakeLabel(getCompactFileLabel(resourceUrl, fallbackLabel));

export const MentorLearningPath = () => {
  const { modal } = App.useApp();
  const [paths, setPaths] = useState<LearningPathItem[]>([]);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPathId, setSelectedPathId] = useState<string>('');

  const [modules, setModules] = useState<LearningModuleItem[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState<string>('');

  const [isLoading, setIsLoading] = useState(false);
  const [isSavingPath, setIsSavingPath] = useState(false);
  const [isCreatingPath, setIsCreatingPath] = useState(false);
  const [isFinalTestLoading, setIsFinalTestLoading] = useState(false);
  const [isFinalTestSaving, setIsFinalTestSaving] = useState(false);

  const [moduleModalOpen, setModuleModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<LearningModuleItem | null>(null);
  const [contentModalOpen, setContentModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<ModuleContentItem | null>(null);
  const [pathModalOpen, setPathModalOpen] = useState(false);
  const [pathEditModalOpen, setPathEditModalOpen] = useState(false);
  const [finalTestModalOpen, setFinalTestModalOpen] = useState(false);

  const [documentFileList, setDocumentFileList] = useState<UploadFile[]>([]);
  const [existingDocumentUrls, setExistingDocumentUrls] = useState<string[]>([]);
  const [finalTestFileList, setFinalTestFileList] = useState<UploadFile[]>([]);
  const [selectedModuleFinalTest, setSelectedModuleFinalTest] = useState<ModuleFinalTest | null>(null);

  const [pathForm] = Form.useForm();
  const [moduleForm] = Form.useForm();
  const [contentForm] = Form.useForm();
  const [createPathForm] = Form.useForm();
  const [finalTestForm] = Form.useForm();

  const selectedModule = useMemo(
    () => modules.find((module) => module.id === selectedModuleId) || null,
    [modules, selectedModuleId],
  );

  const showDeleteBlockedNotice = (content: string) => {
    modal.error({
      title: 'Không thể xóa',
      content,
      okText: 'Đã hiểu',
    });
  };

  const filteredPaths = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    if (!keyword) {
      return paths;
    }

    return paths.filter((path) =>
      [path.title, path.track, path.description]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword)),
    );
  }, [paths, searchText]);

  const loadPaths = async () => {
    setIsLoading(true);
    try {
      const res = await http.get<{ hits?: LearningPathItem[]; data?: LearningPathItem[] }>('/learning-paths');
      const records = res?.hits || res?.data || [];
      setPaths(records);

      const hasCurrentPath = records.some((path) => path.id === selectedPathId);
      const nextId = hasCurrentPath ? selectedPathId : records[0]?.id;
      if (nextId) {
        setSelectedPathId(nextId);
      } else {
        setSelectedPathId('');
        setModules([]);
        setSelectedModuleId('');
        pathForm.resetFields();
      }
    } catch {
      message.error('Không tải được danh sách lộ trình đào tạo');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPathDetail = async (pathId: string) => {
    if (!pathId) return;
    setIsLoading(true);
    try {
      const detail = await http.get<any>(`/learning-paths/${pathId}`);
      const nextModules = (detail?.modules || []).sort((a: LearningModuleItem, b: LearningModuleItem) => a.orderIndex - b.orderIndex);
      setModules(nextModules);
      setSelectedModuleId((currentSelectedModuleId) => {
        const hasCurrentModule = nextModules.some((module: LearningModuleItem) => module.id === currentSelectedModuleId);
        return hasCurrentModule ? currentSelectedModuleId : nextModules[0]?.id || '';
      });

      pathForm.setFieldsValue({
        title: detail?.title,
        track: detail?.track,
        description: detail?.description,
      });
    } catch {
      message.error('Không tải được chi tiết lộ trình đào tạo');
      setModules([]);
      setSelectedModuleId('');
    } finally {
      setIsLoading(false);
    }
  };

  const loadModuleFinalTest = async (moduleId: string) => {
    if (!moduleId) {
      setSelectedModuleFinalTest(null);
      return;
    }

    setIsFinalTestLoading(true);
    try {
      const response = await getModuleFinalTest(moduleId);
      setSelectedModuleFinalTest(response?.data?.finalTest || null);
    } catch {
      setSelectedModuleFinalTest(null);
      message.error('Không thể tải bài kiểm tra cuối học phần');
    } finally {
      setIsFinalTestLoading(false);
    }
  };

  useEffect(() => {
    loadPaths();
  }, []);

  useEffect(() => {
    if (!selectedPathId) return;
    loadPathDetail(selectedPathId);
  }, [selectedPathId]);

  useEffect(() => {
    if (!selectedModuleId) {
      setSelectedModuleFinalTest(null);
      return;
    }

    loadModuleFinalTest(selectedModuleId);
  }, [selectedModuleId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredPaths.length / LIST_PAGE_SIZE));

    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, filteredPaths.length]);

  const savePathMetadata = async () => {
    if (!selectedPathId) return;
    try {
      const values = await pathForm.validateFields();
      setIsSavingPath(true);
      await http.patch(`/learning-paths/${selectedPathId}`, values);
      message.success('Cập nhật thông tin lộ trình thành công');
      setPathEditModalOpen(false);
      await loadPaths();
      await loadPathDetail(selectedPathId);
    } catch {
      message.error('Không thể cập nhật lộ trình');
    } finally {
      setIsSavingPath(false);
    }
  };

  const openCreatePath = () => {
    createPathForm.resetFields();
    setPathModalOpen(true);
  };

  const submitCreatePath = async () => {
    try {
      const values = await createPathForm.validateFields();
      const payload = {
        ...values,
        track: values.title,
      };
      setIsCreatingPath(true);
      const created = await http.post<{ id?: string; data?: { id?: string } }>('/learning-paths', payload);
      const createdId = created?.id || created?.data?.id;

      message.success('Tạo lộ trình đào tạo thành công');
      setPathModalOpen(false);
      await loadPaths();

      if (createdId) {
        setSelectedPathId(createdId);
      }
    } catch (error: any) {
      if (!error?.errorFields) {
        message.error('Không thể tạo lộ trình đào tạo');
      }
    } finally {
      setIsCreatingPath(false);
    }
  };

  const openEditPath = (path: LearningPathItem) => {
    setSelectedPathId(path.id);
    pathForm.setFieldsValue({
      title: path.title,
      track: path.track,
      description: path.description,
    });
    setPathEditModalOpen(true);
  };

  const getPathModuleCount = (path: LearningPathItem) => {
    if (path.id === selectedPathId) {
      return modules.length;
    }

    if (typeof path.moduleCount === 'number') {
      return path.moduleCount;
    }

    if (Array.isArray(path.modules)) {
      return path.modules.length;
    }

    return null;
  };

  const removePath = async (path: LearningPathItem) => {
    let moduleCount = getPathModuleCount(path);

    if (moduleCount === null) {
      try {
        const detail = await http.get<any>(`/learning-paths/${path.id}`);
        moduleCount = Array.isArray(detail?.modules) ? detail.modules.length : 0;
      } catch {
        message.error('Không thể kiểm tra dữ liệu lộ trình đào tạo');
        return;
      }
    }

    if (moduleCount > 0) {
      showDeleteBlockedNotice('Lộ trình đào tạo vẫn còn học phần bên trong nên không thể xóa.');
      return;
    }

    try {
      await http.delete(`/learning-paths/${path.id}`);
      message.success('Đã xóa lộ trình đào tạo');
      await loadPaths();
    } catch {
      showDeleteBlockedNotice('Không thể xóa lộ trình đào tạo.');
    }
  };

  const openCreateModule = () => {
    setEditingModule(null);
    moduleForm.resetFields();
    moduleForm.setFieldValue('orderIndex', modules.length + 1);
    setModuleModalOpen(true);
  };

  const openEditModule = (module: LearningModuleItem) => {
    setEditingModule(module);
    moduleForm.setFieldsValue(module);
    setModuleModalOpen(true);
  };

  const submitModule = async () => {
    if (!selectedPathId) return;

    try {
      const values = await moduleForm.validateFields();
      if (editingModule) {
        await http.patch(`/modules/${editingModule.id}`, { ...values, learningPathId: selectedPathId });
      } else {
        await http.post('/modules', { ...values, learningPathId: selectedPathId });
      }

      message.success('Lưu học phần thành công');
      setModuleModalOpen(false);
      await loadPathDetail(selectedPathId);
    } catch (error: any) {
      if (!error?.errorFields) {
        message.error('Không thể lưu học phần');
      }
    }
  };

  const removeModule = async (module: LearningModuleItem) => {
    if ((module.contents?.length || 0) > 0) {
      showDeleteBlockedNotice('Học phần vẫn còn bài giảng bên trong nên không thể xóa.');
      return;
    }

    try {
      await http.delete(`/modules/${module.id}`);
      message.success('Đã xóa học phần');
      await loadPathDetail(selectedPathId);
    } catch {
      showDeleteBlockedNotice('Không thể xóa học phần.');
    }
  };

  const moveModule = async (moduleId: string, direction: 'up' | 'down') => {
    const currentIndex = modules.findIndex((module) => module.id === moduleId);
    if (currentIndex < 0) return;

    const nextIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (nextIndex < 0 || nextIndex >= modules.length) return;

    const reordered = [...modules];
    const [item] = reordered.splice(currentIndex, 1);
    reordered.splice(nextIndex, 0, item);

    const payload = reordered.map((module, index) => ({
      id: module.id,
      orderIndex: index + 1,
    }));

    try {
      await http.put(`/modules/learning-path/${selectedPathId}/order`, { modules: payload });
      setModules(
        reordered.map((module, index) => ({
          ...module,
          orderIndex: index + 1,
        })),
      );
      message.success('Đã cập nhật thứ tự học phần');
    } catch {
      message.error('Không thể cập nhật thứ tự học phần');
    }
  };

  const openCreateContent = () => {
    setEditingContent(null);
    contentForm.resetFields();
    setDocumentFileList([]);
    setExistingDocumentUrls([]);
    setContentModalOpen(true);
  };

  const openEditContent = (content: ModuleContentItem) => {
    setEditingContent(content);
    contentForm.setFieldsValue({
      title: content.title,
      contentUrl: content.contentUrl,
      assessmentFileUrl: content.metadata?.assessmentFileUrl,
    });
    setDocumentFileList([]);
    setExistingDocumentUrls(Array.isArray(content.metadata?.documentUrls) ? content.metadata.documentUrls : []);
    setContentModalOpen(true);
  };

  const removeExistingDocument = (targetIndex: number) => {
    setExistingDocumentUrls((currentUrls) => currentUrls.filter((_, index) => index !== targetIndex));
  };

  const uploadDocumentFile = async (file: File): Promise<string> => {
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    const uploadResult = await http.post<{ fileName?: string; data?: { fileName?: string } }>(
      '/storage/upload',
      uploadFormData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    const fileName = uploadResult?.fileName || uploadResult?.data?.fileName;
    if (!fileName) {
      throw new Error('Upload tài liệu thất bại');
    }

    const urlResult = await http.get<{ url?: string; data?: { url?: string } }>(`/storage/url/${encodeURIComponent(fileName)}`);
    const fileUrl = urlResult?.url || urlResult?.data?.url;
    return fileUrl || fileName;
  };

  const uploadFileNameToStorage = async (file: File): Promise<string> => {
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    const uploadResult = await http.post<{ fileName?: string; data?: { fileName?: string } }>(
      '/storage/upload',
      uploadFormData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    const fileName = uploadResult?.fileName || uploadResult?.data?.fileName;
    if (!fileName) {
      throw new Error('Upload tài liệu thất bại');
    }

    return fileName;
  };

  const submitContent = async () => {
    if (!selectedModuleId) return;

    try {
      const values = await contentForm.validateFields();
      const uploadedDocumentUrls = await Promise.all(
        documentFileList
          .map((fileItem) => fileItem.originFileObj)
          .filter(Boolean)
          .map((file) => uploadDocumentFile(file as File)),
      );
      const documentUrls = Array.from(new Set([...existingDocumentUrls, ...uploadedDocumentUrls]));
      const payload = {
        moduleId: selectedModuleId,
        type: 'video',
        title: values.title,
        contentUrl: values.contentUrl?.trim() || undefined,
        assessmentFileUrl: values.assessmentFileUrl?.trim() || undefined,
        documentUrls,
      };

      if (editingContent) {
        await http.patch(`/training-content/contents/${editingContent.id}`, payload);
      } else {
        await http.post('/training-content/contents', payload);
      }
      message.success('Lưu bài giảng thành công');
      setContentModalOpen(false);
      setDocumentFileList([]);
      setExistingDocumentUrls([]);
      await loadPathDetail(selectedPathId);
    } catch (error: any) {
      if (!error?.errorFields) {
        message.error('Không thể lưu bài giảng');
      }
    }
  };

  const openFinalTestModal = () => {
    finalTestForm.setFieldsValue({
      description: selectedModuleFinalTest?.description,
      materialLink: selectedModuleFinalTest?.materialLink,
    });
    setFinalTestFileList([]);
    setFinalTestModalOpen(true);
  };

  const submitFinalTest = async () => {
    if (!selectedModuleId) return;

    try {
      const values = await finalTestForm.validateFields();
      const nextFile = finalTestFileList[0]?.originFileObj;
      const uploadedFileName = nextFile ? await uploadFileNameToStorage(nextFile as File) : selectedModuleFinalTest?.materialFile?.fileName;
      const uploadedOriginalName = nextFile
        ? (nextFile as File).name
        : selectedModuleFinalTest?.materialFile?.originalName || selectedModuleFinalTest?.materialFile?.fileName;

      setIsFinalTestSaving(true);
      const response = await upsertModuleFinalTest(selectedModuleId, {
        description: values.description,
        materialLink: values.materialLink,
        materialFileName: uploadedFileName,
        materialOriginalName: uploadedOriginalName || undefined,
      });

      setSelectedModuleFinalTest(response?.data || null);
      setFinalTestModalOpen(false);
      setFinalTestFileList([]);
      message.success('Đã lưu bài kiểm tra cuối học phần');
    } catch (error: any) {
      if (!error?.errorFields) {
        message.error('Không thể lưu bài kiểm tra cuối học phần');
      }
    } finally {
      setIsFinalTestSaving(false);
    }
  };

  const removeContent = async (contentId: string) => {
    try {
      await http.delete(`/training-content/contents/${contentId}`);
      message.success('Đã xóa bài giảng');
      await loadPathDetail(selectedPathId);
    } catch {
      message.error('Không thể xóa bài giảng');
    }
  };

  const pathColumns: ColumnsType<LearningPathItem> = [
    {
      title: 'STT',
      key: 'index',
      width: 90,
      align: 'center',
      render: (_value, _record, index) => (currentPage - 1) * LIST_PAGE_SIZE + index + 1,
    },
    {
      title: 'Tên lộ trình',
      dataIndex: 'title',
      key: 'title',
      render: (value: string) => (
        <Text strong style={{ color: '#27364b' }}>
          {value}
        </Text>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      render: (value?: string) => <Text type='secondary'>{value?.trim() || '-'}</Text>,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 150,
      align: 'center',
      render: (_value, record) => (
        <Space size={8}>
          <Button
            type='text'
            icon={<EditOutlined />}
            onClick={(event) => {
              event.stopPropagation();
              openEditPath(record);
            }}
            style={{ paddingInline: 6 }}
          />
          <Popconfirm title='Xóa lộ trình này?' okText='Xóa' cancelText='Hủy' onConfirm={() => removePath(record)}>
            <Button
              danger
              type='text'
              icon={<DeleteOutlined />}
              onClick={(event) => event.stopPropagation()}
              style={{ paddingInline: 6 }}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className='mentor-learning-path-page' style={{ padding: 24 }}>
      <style>{pageStyles}</style>
      <Space direction='vertical' style={{ width: '100%' }} size={16}>
        <Title level={3} style={{ margin: 0 }}>
          Quản lý lộ trình đào tạo
        </Title>

        <div className='learning-path-list-shell'>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 16,
              padding: 20,
              borderBottom: '1px solid #edf2f7',
              flexWrap: 'wrap',
            }}
          >
            <Button
              icon={<PlusOutlined />}
              type='primary'
              onClick={openCreatePath}
            >
              Thêm mới
            </Button>

            <Input
              allowClear
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder='Tìm kiếm lộ trình đào tạo'
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              style={{
                width: 360,
                maxWidth: '100%',
                height: 48,
                borderRadius: 12,
              }}
            />
          </div>

          <Table
            className='learning-path-table'
            rowKey='id'
            columns={pathColumns}
            dataSource={filteredPaths}
            loading={isLoading}
            pagination={{
              current: currentPage,
              pageSize: LIST_PAGE_SIZE,
              total: filteredPaths.length,
              onChange: (page) => setCurrentPage(page),
              showSizeChanger: false,
              position: ['bottomCenter'],
            }}
            locale={{ emptyText: <Empty description='Chưa có lộ trình đào tạo' /> }}
            rowClassName={(record) => (record.id === selectedPathId ? 'learning-path-row-selected' : '')}
            onRow={(record) => ({
              onClick: () => setSelectedPathId(record.id),
              style: { cursor: 'pointer' },
            })}
          />
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={10}>
            <Card
              title={`Danh sách học phần (${modules.length})`}
              style={{ height: '100%' }}
              bodyStyle={{ minHeight: 220 }}
              extra={
                <Button icon={<PlusOutlined />} type='primary' onClick={openCreateModule} disabled={!selectedPathId}>
                  Thêm học phần
                </Button>
              }
              loading={isLoading}
            >
              <List
                dataSource={modules}
                locale={{ emptyText: 'Chưa có học phần' }}
                renderItem={(module) => (
                  <List.Item
                    onClick={() => setSelectedModuleId(module.id)}
                    style={{
                      cursor: 'pointer',
                      background: selectedModuleId === module.id ? '#f0f5ff' : 'transparent',
                      borderRadius: 8,
                      paddingLeft: 12,
                      alignItems: 'center',
                    }}
                    actions={[
                      <Button type='text' icon={<EditOutlined />} onClick={() => openEditModule(module)} style={{ paddingInline: 6 }} />,
                      <Popconfirm
                        title='Xóa học phần này?'
                        description='Dữ liệu bài giảng trong học phần có thể bị ảnh hưởng.'
                        okText='Xóa'
                        cancelText='Hủy'
                        onConfirm={() => removeModule(module)}
                      >
                        <Button
                          danger
                          type='text'
                          icon={<DeleteOutlined />}
                          style={{ paddingInline: 6 }}
                          onClick={(event) => event.stopPropagation()}
                        />
                      </Popconfirm>,
                    ]}
                  >
                    <List.Item.Meta title={`#${module.orderIndex} - ${module.title}`} description={module.description || 'Không có mô tả'} />
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          <Col xs={24} lg={14}>
            <Card
              title={selectedModule ? `Bài giảng của: ${selectedModule.title}` : 'Bài giảng'}
              style={{ height: '100%' }}
              bodyStyle={{ minHeight: 220 }}
              extra={
                <Button icon={<PlusOutlined />} type='primary' onClick={openCreateContent} disabled={!selectedModuleId}>
                  Thêm bài giảng
                </Button>
              }
              loading={isLoading}
            >
              {!selectedModule ? (
                <Empty description='Hãy chọn học phần để quản lý bài giảng' />
              ) : (
                <Space direction='vertical' size={16} style={{ width: '100%' }}>
                  <List
                    dataSource={selectedModule.contents || []}
                    locale={{ emptyText: 'Chưa có bài giảng trong học phần này' }}
                    renderItem={(content) => (
                      <List.Item
                        actions={[
                          <Button type='text' icon={<EditOutlined />} onClick={() => openEditContent(content)} />,
                          <Popconfirm title='Xóa bài giảng này?' okText='Xóa' cancelText='Hủy' onConfirm={() => removeContent(content.id)}>
                            <Button danger type='text' icon={<DeleteOutlined />} />
                          </Popconfirm>,
                        ]}
                      >
                        <List.Item.Meta
                          title={content.title}
                          description={
                            <Space direction='vertical' size={6} style={{ width: '100%' }}>
                              <Text type='secondary' style={{ wordBreak: 'break-all' }}>
                                Video: {content.contentUrl ? getCompactLinkLabel(content.contentUrl, 'Khong co URL') : 'Không có URL'}
                              </Text>
                              {content.metadata?.assessmentFileUrl ? (
                                <Text type='secondary' style={{ wordBreak: 'break-word' }}>
                                  Đường link tài liệu: {getCompactLinkLabel(content.metadata.assessmentFileUrl, 'Mở tài liệu')}
                                </Text>
                              ) : null}
                              {Array.isArray(content.metadata?.documentUrls) && content.metadata.documentUrls.length > 0 ? (
                                <Text type='secondary'>
                                  Tài liệu đính kèm:{' '}
                                  {content.metadata.documentUrls
                                    .slice(0, 2)
                                    .map((url) => getTrainingDisplayFileLabel(url))
                                    .join(', ')}
                                  {content.metadata.documentUrls.length > 2 ? ` +${content.metadata.documentUrls.length - 2} file` : ''}
                                </Text>
                              ) : null}
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />

                  <Card
                    title='Bài kiểm tra cuối học phần'
                    loading={isFinalTestLoading}
                    extra={
                      <Button type='primary' onClick={openFinalTestModal} disabled={!selectedModuleId}>
                        {selectedModuleFinalTest ? 'Chỉnh sửa bài kiểm tra' : 'Tạo bài kiểm tra'}
                      </Button>
                    }
                    style={{ borderRadius: 12, border: '1px solid #E2E8F0' }}
                    bodyStyle={{ padding: 20 }}
                  >
                    {selectedModuleFinalTest ? (
                      <Space direction='vertical' size={12} style={{ width: '100%' }}>
                        <Text strong>Mô tả</Text>
                        <Text type='secondary' style={{ whiteSpace: 'pre-wrap' }}>
                          {selectedModuleFinalTest.description || 'Chưa có mô tả cho bài kiểm tra cuối học phần.'}
                        </Text>
                        {selectedModuleFinalTest.materialFile?.url ? (
                          <Button
                            icon={<DownloadOutlined />}
                            onClick={() => window.open(selectedModuleFinalTest.materialFile?.url || '', '_blank', 'noopener,noreferrer')}
                          >
                            {getTrainingDisplayFileLabel(
                              selectedModuleFinalTest.materialFile.originalName || selectedModuleFinalTest.materialFile.fileName,
                              'download',
                            )}
                          </Button>
                        ) : null}
                        {selectedModuleFinalTest.materialLink ? (
                          <Button
                            icon={<LinkOutlined />}
                            onClick={() => window.open(selectedModuleFinalTest.materialLink || '', '_blank', 'noopener,noreferrer')}
                          >
                            {getCompactLinkLabel(selectedModuleFinalTest.materialLink, 'Mở link tài liệu')}
                          </Button>
                        ) : null}
                      </Space>
                    ) : (
                      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='Học phần này chưa có bài kiểm tra cuối học phần' />
                    )}
                  </Card>
                </Space>
              )}
            </Card>
          </Col>
        </Row>
      </Space>

      <Modal
        title='Chỉnh sửa lộ trình đào tạo'
        open={pathEditModalOpen}
        onCancel={() => setPathEditModalOpen(false)}
        onOk={savePathMetadata}
        confirmLoading={isSavingPath}
        destroyOnClose={false}
        okText='OK'
        cancelText='Hủy'
      >
        <Form form={pathForm} layout='vertical'>
          <Form.Item label='Tên lộ trình' name='title' rules={[{ required: true, message: 'Bắt buộc' }]}>
            <Input />
          </Form.Item>
          <Form.Item label='Track' name='track' rules={[{ required: true, message: 'Bắt buộc' }]}>
            <Input />
          </Form.Item>
          <Form.Item label='Mô tả' name='description'>
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title='Thêm lộ trình đào tạo'
        open={pathModalOpen}
        onCancel={() => setPathModalOpen(false)}
        onOk={submitCreatePath}
        confirmLoading={isCreatingPath}
        destroyOnClose
        okText='OK'
        cancelText='Hủy'
      >
        <Form form={createPathForm} layout='vertical'>
          <Form.Item label='Tên lộ trình' name='title' rules={[{ required: true, message: 'Bắt buộc' }]}>
            <Input placeholder='Ví dụ: Lộ trình Backend' />
          </Form.Item>
          <Form.Item label='Mô tả' name='description'>
            <Input.TextArea rows={3} placeholder='Mô tả ngắn về mục tiêu đào tạo' />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingModule ? 'Cập nhật học phần' : 'Thêm học phần'}
        open={moduleModalOpen}
        onCancel={() => setModuleModalOpen(false)}
        onOk={submitModule}
        destroyOnClose
        okText='OK'
        cancelText='Hủy'
      >
        <Form form={moduleForm} layout='vertical'>
          <Form.Item label='Tên học phần' name='title' rules={[{ required: true, message: 'Bắt buộc' }]}>
            <Input />
          </Form.Item>
          <Form.Item label='Mô tả' name='description'>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item label='Thứ tự' name='orderIndex' rules={[{ required: true, message: 'Bắt buộc' }]}>
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingContent ? 'Cập nhật bài giảng' : 'Thêm bài giảng'}
        open={contentModalOpen}
        onCancel={() => setContentModalOpen(false)}
        onOk={submitContent}
        destroyOnClose
        okText='OK'
        cancelText='Hủy'
      >
        <Form form={contentForm} layout='vertical'>
          <Form.Item label='Tên bài giảng' name='title' rules={[{ required: true, message: 'Bắt buộc' }]}>
            <Input />
          </Form.Item>
          <Form.Item label='Link video' name='contentUrl'>
            <Input />
          </Form.Item>
          <Form.Item label='Upload tài liệu'>
            <Upload multiple fileList={documentFileList} beforeUpload={() => false} onChange={({ fileList }) => setDocumentFileList(fileList)}>
              <Button>Chọn tài liệu</Button>
            </Upload>
            {existingDocumentUrls.length > 0 ? (
              <Space direction='vertical' size={4} style={{ display: 'flex', marginTop: 8 }}>
                <Text type='secondary'>Tài liệu hiện tại:</Text>
                {existingDocumentUrls.map((url, index) => (
                  <div
                    key={`${url}-${index}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                      width: '100%',
                    }}
                  >
                    <Button
                      type='link'
                      icon={<DownloadOutlined />}
                      style={{
                        paddingInline: 0,
                        minWidth: 0,
                        maxWidth: 'calc(100% - 40px)',
                        justifyContent: 'flex-start',
                      }}
                      onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
                    >
                      <span
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {getTrainingDisplayFileLabel(url, `Tài liệu ${index + 1}`)}
                      </span>
                    </Button>
                    <Popconfirm
                      title='Xoá tài liệu này khỏi bài giảng?'
                      okText='Xoá'
                      cancelText='Huỷ'
                      onConfirm={() => removeExistingDocument(index)}
                    >
                      <Button danger type='text' icon={<DeleteOutlined />} style={{ paddingInline: 4, flex: '0 0 auto' }} />
                    </Popconfirm>
                  </div>
                ))}
              </Space>
            ) : null}
          </Form.Item>
          <Form.Item label='Đường link tài liệu' name='assessmentFileUrl'>
            <Input placeholder='Ví dụ: Google Drive, Google Docs, Notion...' />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={selectedModuleFinalTest ? 'Chỉnh sửa bài kiểm tra cuối học phần' : 'Tạo bài kiểm tra cuối học phần'}
        open={finalTestModalOpen}
        onCancel={() => setFinalTestModalOpen(false)}
        onOk={submitFinalTest}
        confirmLoading={isFinalTestSaving}
        destroyOnClose
        okText='OK'
        cancelText='Hủy'
      >
        <Form form={finalTestForm} layout='vertical'>
          <Form.Item label='Mô tả' name='description'>
            <Input.TextArea rows={4} placeholder='Mô tả yêu cầu thực hiện sau khi học xong học phần' />
          </Form.Item>
          <Form.Item label='Upload tài liệu'>
            <Upload maxCount={1} fileList={finalTestFileList} beforeUpload={() => false} onChange={({ fileList }) => setFinalTestFileList(fileList)}>
              <Button>Chọn tài liệu</Button>
            </Upload>
            {selectedModuleFinalTest?.materialFile?.originalName || selectedModuleFinalTest?.materialFile?.fileName ? (
              <Text type='secondary' style={{ display: 'block', marginTop: 8 }}>
                Tài liệu hiện tại:{' '}
                {getTrainingDisplayFileLabel(
                  selectedModuleFinalTest?.materialFile?.originalName || selectedModuleFinalTest?.materialFile?.fileName || '',
                )}
              </Text>
            ) : null}
          </Form.Item>
          <Form.Item label='Đường link tài liệu' name='materialLink'>
            <Input placeholder='Ví dụ: Google Drive, Docs, Figma...' />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
