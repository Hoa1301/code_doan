import { useState, useEffect } from 'react';
import {
    Button,
    Card,
    Col,
    Form,
    Input,
    InputNumber,
    Layout,
    Radio,
    Row,
    Space,
    Typography,
    message,
    Empty
} from 'antd';
import {
    PlusOutlined,
    SaveOutlined,
    DeleteOutlined,
    ArrowLeftOutlined,
    EyeOutlined,
    CheckCircleFilled
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreateQuiz, useUpdateQuiz, useQuiz } from '../../../hooks/Internship/useQuizzes';
import { QuizQuestion } from '../../../services/Internship/quizzes';
import { useResponsive } from '../../../hooks/useResponsive';

const { Title, Text } = Typography;
const { Content, Sider } = Layout;

interface QuizFormValues {
    title: string;
    moduleId?: number;
    duration?: number;
    passScore?: number;
}

export const QuizBuilder = () => {
    const { t } = useTranslation();
    const { isMobile, isLaptop } = useResponsive();
    const navigate = useNavigate();
    const { id } = useParams();
    const [form] = Form.useForm();

    // Fetch existing quiz if updating
    const { data: quizData } = useQuiz(id || '');
    const createMutation = useCreateQuiz();
    const updateMutation = useUpdateQuiz();

    const [questions, setQuestions] = useState<QuizQuestion[]>([]);

    useEffect(() => {
        if (quizData?.data) {
            form.setFieldsValue({
                title: quizData.data.title,
                moduleId: quizData.data.moduleId,
                passScore: 80, // Default or from meta
                duration: 15 // Default or from meta
            });
            setQuestions(quizData.data.questions || []);
        }
    }, [quizData, form]);

    const handleAddQuestion = () => {
        const newQuestion: QuizQuestion = {
            id: `q-${Date.now()}`,
            text: '',
            options: ['', '', '', ''],
            correct: 0
        };
        setQuestions([...questions, newQuestion]);
    };

    const handleRemoveQuestion = (index: number) => {
        const newQuestions = [...questions];
        newQuestions.splice(index, 1);
        setQuestions(newQuestions);
    };

    const handleQuestionChange = (
        index: number,
        field: 'text' | 'correct',
        value: QuizQuestion['text'] | QuizQuestion['correct']
    ) => {
        const newQuestions = [...questions];
        const current = newQuestions[index];
        if (!current) return;
        if (field === 'text' && typeof value === 'string') {
            newQuestions[index] = { ...current, text: value };
        }
        if (field === 'correct' && typeof value === 'number') {
            newQuestions[index] = { ...current, correct: value };
        }
        setQuestions(newQuestions);
    };

    const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options[oIndex] = value;
        setQuestions(newQuestions);
    };

    const handleSave = async (values: QuizFormValues) => {
        if (questions.length === 0) {
            message.error(t('quiz.error_no_questions'));
            return;
        }

        const quizPayload = {
            title: values.title,
            moduleId: values.moduleId || 1, // Mock module ID
            questions: questions,
            meta: `${questions.length} Questions`
        };

        try {
            if (id) {
                await updateMutation.mutate({ id, ...quizPayload });
                message.success(t('quiz.update_success'));
            } else {
                await createMutation.mutate(quizPayload);
                message.success(t('quiz.create_success'));
            }
            navigate('/mentor/learning-path');
        } catch {
            message.error(t('common.error'));
        }
    };

    return (
        <Layout
            style={{
                minHeight: '100vh',
                background: '#f5f5f5',
                flexDirection: isMobile ? 'column' : 'row'
            }}
        >
            <Sider
                width={isMobile ? '100%' : isLaptop ? 300 : 350}
                theme='light'
                style={{
                    padding: isMobile ? '12px' : isLaptop ? '18px' : '24px',
                    borderRight: isMobile ? 'none' : '1px solid #e8e8e8',
                    borderBottom: isMobile ? '1px solid #e8e8e8' : 'none'
                }}
            >
                <Space direction='vertical' style={{ width: '100%' }} size='large'>
                    <div>
                        <Button icon={<ArrowLeftOutlined />} type='text' onClick={() => navigate(-1)}>
                            {t('common.back')}
                        </Button>
                        <Title level={3} style={{ marginTop: 8 }}>
                            {id ? t('quiz.edit_quiz') : t('quiz.builder_title')}
                        </Title>
                    </div>

                    <Form form={form} layout='vertical' onFinish={handleSave}>
                        <Form.Item
                            name='title'
                            label={t('quiz.title')}
                            rules={[{ required: true, message: t('common.required_field') }]}
                        >
                            <Input placeholder={t('quiz.title')} />
                        </Form.Item>

                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <Form.Item name='duration' label={t('quiz.duration')} initialValue={15}>
                                    <InputNumber min={5} style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name='passScore' label={t('quiz.pass_score')} initialValue={80}>
                                    <InputNumber style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item label={t('quiz.total_questions')}>
                            <Text strong style={{ fontSize: 24 }}>
                                {questions.length}
                            </Text>
                        </Form.Item>

                        <Button
                            type='primary'
                            htmlType='submit'
                            icon={<SaveOutlined />}
                            block
                            size='large'
                            loading={createMutation.isLoading || updateMutation.isLoading}
                        >
                            {t('quiz.save_quiz')}
                        </Button>
                    </Form>
                </Space>
            </Sider>

            <Content
                style={{
                    padding: isMobile ? '12px' : isLaptop ? '18px' : '24px',
                    overflowY: 'auto',
                    height: isMobile ? 'auto' : '100vh'
                }}
            >
                <div style={{ maxWidth: 800, margin: '0 auto' }}>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: isMobile ? 'flex-start' : 'center',
                            flexDirection: isMobile ? 'column' : 'row',
                            gap: isMobile ? 10 : 0,
                            marginBottom: 24
                        }}
                    >
                        <Title level={4}>{t('quiz.questions_list')}</Title>
                        <Space wrap>
                            <Button icon={<EyeOutlined />}>{t('quiz.preview')}</Button>
                            <Button type='primary' icon={<PlusOutlined />} onClick={handleAddQuestion}>
                                {t('quiz.add_question')}
                            </Button>
                        </Space>
                    </div>

                    {questions.length === 0 ? (
                        <Empty description={t('quiz.no_questions')} />
                    ) : (
                        <Space direction='vertical' style={{ width: '100%' }} size='middle'>
                            {questions.map((q, index) => (
                                <Card
                                    key={q.id || index}
                                    title={
                                        <Space wrap>
                                            <div
                                                style={{
                                                    background: '#1E40AF',
                                                    color: '#fff',
                                                    width: 24,
                                                    height: 24,
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: 12
                                                }}
                                            >
                                                {index + 1}
                                            </div>
                                            <Text strong>{t('quiz.question')} {index + 1}</Text>
                                        </Space>
                                    }
                                    extra={
                                        <Button
                                            danger
                                            type='text'
                                            icon={<DeleteOutlined />}
                                            onClick={() => handleRemoveQuestion(index)}
                                        />
                                    }
                                >
                                    <Input.TextArea
                                        placeholder={t('quiz.question_placeholder')}
                                        value={q.text}
                                        onChange={(e) => handleQuestionChange(index, 'text', e.target.value)}
                                        rows={2}
                                        style={{ marginBottom: 16 }}
                                    />

                                    <div style={{ marginBottom: 8 }}>
                                        <Text strong>{t('quiz.options')}</Text>
                                    </div>

                                    <Radio.Group
                                        onChange={(e) => handleQuestionChange(index, 'correct', e.target.value)}
                                        value={q.correct}
                                        style={{ width: '100%' }}
                                    >
                                        <Space direction='vertical' style={{ width: '100%' }}>
                                            {q.options.map((opt, oIndex) => (
                                                <div key={oIndex} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                                    <Radio value={oIndex} />
                                                    <Input
                                                        placeholder={`${t('quiz.option_placeholder')} ${oIndex + 1}`}
                                                        value={opt}
                                                        onChange={(e) => handleOptionChange(index, oIndex, e.target.value)}
                                                        prefix={q.correct === oIndex ? <CheckCircleFilled style={{ color: '#10B981' }} /> : null}
                                                        style={{
                                                            borderColor: q.correct === oIndex ? '#10B981' : undefined,
                                                            background: q.correct === oIndex ? '#f6ffed' : undefined
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </Space>
                                    </Radio.Group>
                                </Card>
                            ))}
                        </Space>
                    )}

                    <div style={{ textAlign: 'center', marginTop: 32, marginBottom: 50 }}>
                        <Button type='dashed' icon={<PlusOutlined />} onClick={handleAddQuestion} block style={{ height: 48 }}>
                            {t('quiz.add_question')}
                        </Button>
                    </div>
                </div>
            </Content>
        </Layout>
    );
};
