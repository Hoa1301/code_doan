import {
    LeftOutlined,
    RightOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    BulbOutlined,
    DashboardOutlined,
    FileSearchOutlined,
    CloseOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';
import { Button, Card, Progress, Radio, Space, Typography, message, Modal, Result, Spin, Divider } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { RouteConfig } from '../../../constants';
import { useLearningPath } from '../../../hooks/Internship/useLearningPath';
import { useMeIntern } from '../../../hooks/Internship/useInterns';
import { useMyProgress } from '../../../hooks/Internship/useStudentProgress';
import { useQuiz, useSubmitQuiz } from '../../../hooks/Internship/useQuizzes';
import { Intern } from '../../../services/Internship/interns';
import { LearningPath } from '../../../services/Internship/learningPath';
import { Quiz, QuizQuestion } from '../../../services/Internship/quizzes';
import { StudentProgress } from '../../../services/Internship/studentProgress';

const { Title, Text, Paragraph } = Typography;

interface QuizOptionView {
    label: string;
    value: string;
}

interface QuizQuestionView {
    id: string;
    text: string;
    options: QuizOptionView[];
    correctAnswer: string;
}

interface QuizView {
    id: string;
    title: string;
    description?: string;
    timeLimitMinutes?: number;
    passingScore: number;
    questions: QuizQuestionView[];
}

interface QuizOptionRecord {
    key?: string;
    label?: string;
    text?: string;
    value?: string;
}

type RawQuestion = QuizQuestion & {
    correct?: number | string;
    text?: string;
    options?: Array<string | QuizOptionRecord>;
};

interface InternQuiz extends Quiz {
    questions?: RawQuestion[];
}

type InternModule = LearningPath['modules'][number] & {
    quizzes?: Array<Pick<Quiz, 'id' | 'title'>>;
};

interface QuizAttemptSummary {
    score?: number;
    totalPoints?: number;
}

const normalizeQuestion = (question: RawQuestion, index: number): QuizQuestionView => {
    const correctAnswer = String(question?.correctAnswer ?? question?.correct ?? '');
    const rawOptions = Array.isArray(question?.options) ? question.options : [];
    const usesOptionIndex =
        correctAnswer !== '' && Number.isInteger(Number(correctAnswer)) && Number(correctAnswer) >= 0 && Number(correctAnswer) < rawOptions.length;

    const options = rawOptions.map((option, optionIndex: number) => {
        if (typeof option === 'string') {
            return {
                label: option,
                value: usesOptionIndex ? String(optionIndex) : option
            };
        }

        if (option && typeof option === 'object') {
            const optionRecord = option as QuizOptionRecord;
            const optionLabel = String(optionRecord.value ?? optionRecord.label ?? optionRecord.text ?? `Option ${optionIndex + 1}`);
            const optionValue = String(optionRecord.key ?? optionRecord.value ?? optionRecord.label ?? optionIndex);

            return {
                label: optionLabel,
                value: optionValue
            };
        }

        return {
            label: String(option ?? `Option ${optionIndex + 1}`),
            value: String(optionIndex)
        };
    });

    return {
        id: String(question?.id ?? index),
        text: String(question?.questionText ?? question?.text ?? `Question ${index + 1}`),
        options,
        correctAnswer
    };
};

export const InternTest = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [timeLeft, setTimeLeft] = useState(600);
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [showAnswers, setShowAnswers] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const requestedQuizId = searchParams.get('quizId') || '';
    const requestedModuleId = searchParams.get('moduleId') || '';

    const { data: internRes, isLoading: isLoadingIntern } = useMeIntern();
    const { data: progressRes, isLoading: isLoadingProgress } = useMyProgress();

    const intern = (internRes?.data || internRes) as Intern | null;
    const progress = (progressRes?.data || progressRes) as StudentProgress | null;
    const learningTrack = intern?.track || progress?.learningPath?.track || '';

    const { data: learningPathRes, isLoading: isLoadingLearningPath } = useLearningPath(learningTrack);
    const learningPath = (learningPathRes?.data || learningPathRes) as LearningPath | null;
    const modules = useMemo<InternModule[]>(() => {
        return Array.isArray(learningPath?.modules) ? (learningPath.modules as InternModule[]) : [];
    }, [learningPath]);

    const activeModule = useMemo<InternModule | null>(() => {
        if (!modules.length) {
            return null;
        }

        if (requestedModuleId) {
            const matchedModule = modules.find((module) => String(module.id) === String(requestedModuleId));

            if (matchedModule) {
                return matchedModule;
            }
        }

        if (progress?.currentModuleId) {
            const progressModule = modules.find((module) => String(module.id) === String(progress.currentModuleId));

            if (progressModule) {
                return progressModule;
            }
        }

        return modules[0];
    }, [modules, progress?.currentModuleId, requestedModuleId]);

    const selectedQuizId = requestedQuizId || activeModule?.quizzes?.[0]?.id || '';
    const { data: quizRes, isLoading: isLoadingQuiz } = useQuiz(selectedQuizId);
    const submitQuiz = useSubmitQuiz();

    const normalizedQuiz = useMemo<QuizView | null>(() => {
        const quiz = (quizRes?.data || quizRes) as InternQuiz | null;

        if (!quiz?.id) {
            return null;
        }

        return {
            id: String(quiz.id),
            title: String(quiz.title || t('intern_dashboard.syllabus')),
            description: quiz.description ? String(quiz.description) : undefined,
            timeLimitMinutes: typeof quiz.timeLimitMinutes === 'number' ? quiz.timeLimitMinutes : undefined,
            passingScore: Number(quiz.passingScore || 80),
            questions: Array.isArray(quiz.questions)
                ? quiz.questions.map((question, index: number) => normalizeQuestion(question, index))
                : []
        };
    }, [quizRes, t]);

    const handleSubmit = useCallback(async () => {
        if (!normalizedQuiz || isSubmitting || submitted) {
            return;
        }

        if (normalizedQuiz.questions.length === 0) {
            message.error(t('common.error'));
            return;
        }

        let finalScore = 0;

        normalizedQuiz.questions.forEach((question) => {
            if (answers[question.id] === question.correctAnswer) {
                finalScore += 1;
            }
        });

        const calculatedScore = Math.round((finalScore / normalizedQuiz.questions.length) * 100);
        setScore(calculatedScore);
        setIsSubmitting(true);

        try {
            const submitResult = await submitQuiz.mutate(normalizedQuiz.id, answers);
            const attemptSummary = (submitResult.data || submitResult) as QuizAttemptSummary;
            const backendScore =
                typeof attemptSummary.score === 'number' &&
                typeof attemptSummary.totalPoints === 'number' &&
                attemptSummary.totalPoints > 0
                    ? Math.round((attemptSummary.score / attemptSummary.totalPoints) * 100)
                    : calculatedScore;

            setScore(backendScore);
            setSubmitted(true);
            message.success(t('test.submitted_success') || 'Nop ket qua bai kiem tra thanh cong!');
        } catch {
            message.error('Nop ket qua that bai. Vui long thu lai.');
        } finally {
            setIsSubmitting(false);
        }
    }, [answers, isSubmitting, normalizedQuiz, submitQuiz, submitted, t]);

    useEffect(() => {
        setCurrentQuestion(0);
        setAnswers({});
        setSubmitted(false);
        setScore(0);
        setShowAnswers(false);
        setIsSubmitting(false);
        setTimeLeft((normalizedQuiz?.timeLimitMinutes || 10) * 60);
    }, [normalizedQuiz?.id, normalizedQuiz?.timeLimitMinutes]);

    useEffect(() => {
        if (!normalizedQuiz || submitted) {
            return;
        }

        if (timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft((previousValue) => previousValue - 1), 1000);
            return () => clearInterval(timer);
        }

        void handleSubmit();
    }, [handleSubmit, normalizedQuiz, submitted, timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleAnswerChange = (value: string) => {
        const currentQuestionId = normalizedQuiz?.questions[currentQuestion]?.id;

        if (!currentQuestionId) {
            return;
        }

        setAnswers((previousAnswers) => ({
            ...previousAnswers,
            [currentQuestionId]: value
        }));
    };

    const isLoading =
        isLoadingIntern ||
        isLoadingProgress ||
        (Boolean(learningTrack) && isLoadingLearningPath) ||
        (Boolean(selectedQuizId) && isLoadingQuiz);

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <Spin size='large' tip='Dang tai bai kiem tra...' />
            </div>
        );
    }

    if (!normalizedQuiz) {
        return (
            <div style={{ padding: '48px', maxWidth: '800px', margin: '0 auto' }}>
                <Result
                    status='info'
                    title='Chua co bai kiem tra cho hoc phan hien tai'
                    subTitle='Màn thực tập sinh da dung API that, nhung hoc phan hien tai chua co quiz de lam.'
                    icon={<InfoCircleOutlined />}
                    extra={[
                        <Button
                            key='dashboard'
                            type='primary'
                            icon={<DashboardOutlined />}
                            onClick={() => navigate(RouteConfig.InternLearningPath.path)}
                        >
                            Quay lại bài giảng
                        </Button>
                    ]}
                />
            </div>
        );
    }

    if (submitted) {
        return (
            <div style={{ padding: '48px', textAlign: 'center' }}>
                <Result
                    status={score >= normalizedQuiz.passingScore ? 'success' : 'info'}
                    title={t('test.completed')}
                    subTitle={`Ban dat ${score}% trong bai kiem tra ${normalizedQuiz.title}.`}
                    extra={[
                        <Button
                            type='primary'
                            key='dashboard'
                            icon={<DashboardOutlined />}
                            onClick={() => navigate(RouteConfig.InternLearningPath.path)}
                        >
                            Quay lại bài giảng
                        </Button>,
                        <Button key='review' icon={<FileSearchOutlined />} onClick={() => setShowAnswers(true)}>
                            Xem lai dap an
                        </Button>
                    ]}
                >
                    <div style={{ marginTop: '24px' }}>
                        <Card variant='borderless' style={{ background: '#f8fafc', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '48px' }}>
                                <div>
                                    <Text type='secondary' style={{ display: 'block' }}>
                                        Cau tra loi dung
                                    </Text>
                                    <Title level={3} style={{ margin: 0, color: '#10B981' }}>
                                        {Math.round((score / 100) * normalizedQuiz.questions.length)} / {normalizedQuiz.questions.length}
                                    </Title>
                                </div>
                                <Divider type='vertical' style={{ height: 'auto' }} />
                                <div>
                                    <Text type='secondary' style={{ display: 'block' }}>
                                        Ty le dung
                                    </Text>
                                    <Title level={3} style={{ margin: 0, color: score >= normalizedQuiz.passingScore ? '#1E40AF' : '#f5222d' }}>
                                        {score}%
                                    </Title>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {showAnswers && (
                        <div style={{ marginTop: '32px', textAlign: 'left' }}>
                            <Title level={4}>Xem lai cau hoi</Title>
                            {normalizedQuiz.questions.map((question, index) => (
                                <Card
                                    key={question.id}
                                    variant='borderless'
                                    style={{
                                        marginBottom: '16px',
                                        borderRadius: '12px',
                                        border: '1px solid #E2E8F0'
                                    }}
                                >
                                    <Paragraph strong>
                                        {index + 1}. {question.text}
                                    </Paragraph>
                                    <Space direction='vertical'>
                                        {question.options.map((option) => (
                                            <div
                                                key={`${question.id}-${option.value}`}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    color:
                                                        option.value === question.correctAnswer
                                                            ? '#10B981'
                                                            : answers[question.id] === option.value
                                                                ? '#EF4444'
                                                                : 'inherit'
                                                }}
                                            >
                                                {option.value === question.correctAnswer ? (
                                                    <CheckCircleOutlined />
                                                ) : answers[question.id] === option.value ? (
                                                    <CloseOutlined />
                                                ) : (
                                                    <div style={{ width: 14 }} />
                                                )}
                                                <Text
                                                    style={{
                                                        fontWeight: option.value === question.correctAnswer ? 600 : 400,
                                                        color: 'inherit'
                                                    }}
                                                >
                                                    {option.label}
                                                </Text>
                                            </div>
                                        ))}
                                    </Space>
                                </Card>
                            ))}
                        </div>
                    )}
                </Result>
            </div>
        );
    }

    const currentQuestionItem = normalizedQuiz.questions[currentQuestion];

    return (
        <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
            <Card
                variant='borderless'
                style={{
                    borderRadius: '16px',
                    marginBottom: '24px',
                    position: 'sticky',
                    top: '24px',
                    zIndex: 10,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space size='large'>
                        <div>
                            <Text type='secondary' style={{ display: 'block', fontSize: '12px' }}>
                                {t('test.progress')}
                            </Text>
                            <Text strong>
                                {currentQuestion + 1} / {normalizedQuiz.questions.length} {t('test.questions')}
                            </Text>
                        </div>
                        <Progress
                            type='circle'
                            percent={((currentQuestion + 1) / normalizedQuiz.questions.length) * 100}
                            size={40}
                            strokeColor='#1E40AF'
                        />
                    </Space>
                    <div style={{ textAlign: 'right' }}>
                        <Text type='secondary' style={{ display: 'block', fontSize: '12px' }}>
                            {t('test.time_remaining')}
                        </Text>
                        <Space>
                            <ClockCircleOutlined style={{ color: timeLeft < 60 ? '#EF4444' : '#1E40AF' }} />
                            <Text strong style={{ fontSize: '18px', color: timeLeft < 60 ? '#EF4444' : 'inherit' }}>
                                {formatTime(timeLeft)}
                            </Text>
                        </Space>
                    </div>
                </div>
            </Card>

            <Card
                variant='borderless'
                style={{ borderRadius: '16px', minHeight: '400px' }}
                loading={isSubmitting || submitQuiz.isLoading}
                title={
                    <Space>
                        <BulbOutlined style={{ color: '#1E40AF' }} />
                        <Title level={4} style={{ margin: 0 }}>
                            {normalizedQuiz.title}
                        </Title>
                    </Space>
                }
            >
                {normalizedQuiz.description && (
                    <Paragraph type='secondary' style={{ marginBottom: '24px' }}>
                        {normalizedQuiz.description}
                    </Paragraph>
                )}

                <div style={{ marginBottom: '32px' }}>
                    <Paragraph style={{ fontSize: '18px', fontWeight: 500 }}>{currentQuestionItem.text}</Paragraph>
                    <Radio.Group
                        onChange={(event) => handleAnswerChange(String(event.target.value))}
                        value={answers[currentQuestionItem.id]}
                        style={{ width: '100%' }}
                    >
                        <Space direction='vertical' style={{ width: '100%' }}>
                            {currentQuestionItem.options.map((option, index) => (
                                <Radio.Button
                                    key={`${currentQuestionItem.id}-${option.value}`}
                                    value={option.value}
                                    style={{
                                        width: '100%',
                                        height: 'auto',
                                        padding: '16px',
                                        borderRadius: '8px',
                                        marginBottom: '12px',
                                        textAlign: 'left',
                                        whiteSpace: 'normal',
                                        lineHeight: '1.5'
                                    }}
                                >
                                    {String.fromCharCode(65 + index)}. {option.label}
                                </Radio.Button>
                            ))}
                        </Space>
                    </Radio.Group>
                </div>

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        borderTop: '1px solid #E2E8F0',
                        paddingTop: '24px'
                    }}
                >
                    <Button
                        icon={<LeftOutlined />}
                        disabled={currentQuestion === 0}
                        onClick={() => setCurrentQuestion((previousValue) => previousValue - 1)}
                    >
                        Quay lai
                    </Button>
                    {currentQuestion === normalizedQuiz.questions.length - 1 ? (
                        <Button
                            type='primary'
                            icon={<CheckCircleOutlined />}
                            loading={isSubmitting || submitQuiz.isLoading}
                            onClick={() =>
                                Modal.confirm({
                                    title: t('test.submit_confirm') || 'Submit Test?',
                                    content:
                                        t('test.submit_desc') ||
                                        'Are you sure you want to finish and submit your answers?',
                                    onOk: handleSubmit
                                })
                            }
                        >
                            {t('test.finish_submit')}
                        </Button>
                    ) : (
                        <Button type='primary' onClick={() => setCurrentQuestion((previousValue) => previousValue + 1)}>
                            {t('test.next')} <RightOutlined />
                        </Button>
                    )}
                </div>
            </Card>

            <div style={{ marginTop: '24px', textAlign: 'center' }}>
                <Text type='secondary'>{t('test.instruction')}</Text>
            </div>
        </div>
    );
};
