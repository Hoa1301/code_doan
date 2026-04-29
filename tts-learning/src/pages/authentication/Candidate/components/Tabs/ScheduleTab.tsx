import {
    InputNumber,
    DatePicker,
    Button,
    List,
    Checkbox,
    Col,
    Card,
    Row,
    Select,
    Typography,
    Avatar,
    Modal,
    Tag,
    Input,
    TimePicker,
    Tooltip,
    Tabs,
    Form,
    App
} from 'antd';
import { useEffect, useState } from 'react';
import { http } from '../../../../../utils/http';
import dayjs, { Dayjs } from 'dayjs';
import { notify } from '../../../../../utils/notify';
import { DepartmentSelect } from '../../../../../components/CommonSelect/DepartmentSelect';
import { getErrorMessage } from '../../../../../utils/getErrorMessage';
import { CalendarFilled, CalendarTwoTone, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
const { Text } = Typography;

/* ===== CONFIG CALENDAR ===== */
const START_HOUR = 9;
const END_HOUR = 17;
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

interface ICandidate {
    id: string;
    fullName?: string;
    name?: string;
    avatarUrl?: string;
    avatar?: string;
    job?: { department?: string; title?: string };
}

const LUNCH_START = 12 * 60;
const LUNCH_END = 13 * 60 + 30;

const getValidStartDay = () => {
    const today = dayjs();

    if (today.day() === 6) {
        return today.add(2, 'day');
    }

    if (today.day() === 0) {
        return today.add(1, 'day');
    }

    return today;
};

export const ScheduleTab = () => {
    const { modal } = App.useApp();
    const [formData, setFormData] = useState({
        date: dayjs(),
        time: dayjs(),
        duration: 30,
        type: 'Online',
        status: 'Scheduled',
        infoMeeting: '',
        note: ''
    });
    const [candidates, setCandidates] = useState<ICandidate[]>([]);
    const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);

    const [department, setDepartment] = useState<string>();
    const [duration, setDuration] = useState(30);
    const [interval, setInterval] = useState(10);

    const [timeRange, setTimeRange] = useState<[Dayjs, Dayjs] | null>(null);
    const [schedule, setSchedule] = useState<any[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);

    const [currentWeek, setCurrentWeek] = useState(getValidStartDay());
    const [contextEvent, setContextEvent] = useState<any>(null);
    const [selectedCandidateId, setSelectedCandidateId] = useState<string>();
    const [activeTab, setActiveTab] = useState('all');
    const [form] = Form.useForm();

    const [contextMenu, setContextMenu] = useState<{
        x: number;
        y: number;
        event: any;
    } | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [candidateRes, interviewRes] = await Promise.all([
                    http.get('/candidates', {
                        params: {
                            status: 'cv_dat',
                            page: 1,
                            pageSize: 200,
                            department
                        }
                    }),
                    http.get('/interviews')
                ]);
                const candidateData = candidateRes?.hits || candidateRes?.data || [];
                const interviews = interviewRes?.hits || interviewRes?.data || [];

                const filteredInterviews =
                    department && department !== 'ALL'
                        ? interviews.filter((i: any) => i.job?.department === department)
                        : interviews;

                let resultCandidates: any[] = [];
                let resultSchedule: any[] = [];

                if (activeTab === 'pending') {
                    resultCandidates = candidateData;
                    resultSchedule = [];
                } else {
                    let filtered = filteredInterviews;

                    if (activeTab === 'scheduled') {
                        filtered = filteredInterviews.filter(
                            (i: any) => i.status === activeTab || i.status === 'sent_mail'
                        );
                    } else if (activeTab !== 'all') {
                        filtered = filteredInterviews.filter((i: any) => i.status === activeTab);
                    }

                    const candidateIds = [...new Set(filtered.map((i: any) => i.candidateId))];

                    let interviewCandidates: any[] = [];

                    if (candidateIds.length) {
                        const res = await http.get('/candidates', {
                            params: {
                                ids: candidateIds.join(','),
                                page: 1,
                                pageSize: 200
                            }
                        });

                        interviewCandidates = res?.hits || res?.data || [];
                    }

                    if (activeTab === 'all') {
                        const map = new Map();

                        [...candidateData, ...interviewCandidates].forEach((c) => {
                            map.set(c.id, c);
                        });

                        resultCandidates = Array.from(map.values());
                        resultSchedule = filteredInterviews;
                    } else {
                        resultCandidates = interviewCandidates;
                        resultSchedule = filtered;
                    }
                }

                setCandidates(resultCandidates);
                setSchedule(resultSchedule);
            } catch (err) {
                console.log(err);
                notify.error(getErrorMessage(err));
            }
        };

        fetchData();
    }, [activeTab, department]);

    useEffect(() => {
        if (!department && candidates.length) {
            const firstDept = candidates[0]?.job?.department;
            if (firstDept) setDepartment(firstDept);
        }
    }, [candidates]);

    useEffect(() => {
        http.get('/interviews').then((res) => {
            setSchedule(res.data?.hits || []);
        });
    }, []);

    const getCandidateSchedules = (candidateId: string) => {
        return schedule
            .filter((ev) => ev.candidate?.id === candidateId && ev.status !== 'cancelled')
            .sort((a, b) => dayjs(a.start).valueOf() - dayjs(b.start).valueOf());
    };

    const handleConfirm = async (event: any) => {
        modal.confirm({
            title: 'Xác nhận tham gia?',
            content: 'Ứng viên sẽ được đánh dấu đã tham gia phỏng vấn',
            onOk: async () => {
                try {
                    await http.patch(`/interviews/${event.id}/status`, {
                        status: 'completed'
                    });

                    notify.success('Đã xác nhận tham gia');

                    await reloadAll();
                    // const res = await http.get('/interviews');
                    // setSchedule(res?.hits || res?.data || []);
                } catch (err) {
                    notify.error(getErrorMessage(err));
                }
            }
        });
    };

    const handleRejectInterview = async (event: any) => {
        modal.confirm({
            title: 'Từ chối phỏng vấn?',
            content: 'Lịch sẽ bị hủy',
            okText: 'Xác nhận',
            okButtonProps: { danger: true },
            onOk: async () => {
                try {
                    await http.patch(`/interviews/${event.id}/status`, {
                        status: 'cancelled'
                    });

                    notify.success('Đã hủy lịch phỏng vấn');
                    await reloadAll();
                    // const res = await http.get('/interviews');
                    // setSchedule(res?.hits || res?.data || []);
                } catch (err) {
                    notify.error(getErrorMessage(err));
                }
            }
        });
    };

    const toMinutes = (d: Dayjs) => d.hour() * 60 + d.minute();

    const fromMinutes = (m: number, base: Dayjs) => base.hour(Math.floor(m / 60)).minute(m % 60);

    const isCandidateScheduled = (candidateId: string) => {
        return schedule.some(
            (ev) =>
                ev.candidate?.id === candidateId &&
                ['scheduled', 'sent_mail', 'completed', 'cancelled'].includes(ev.status)
        );
    };

    const getColor = (status: string) => {
        switch (status) {
            case 'scheduled':
                return '#e6f4ff';
            case 'sent_mail':
                return '#e6f4ff';
            case 'completed':
                return '#f6ffed';
            case 'cancelled':
                return '#fff1f0 ';
            case 'rescheduled':
                return '#fffbe6';
            default:
                return '#e6f4ff';
        }
    };
    const calculateWorkingMinutes = (start: Dayjs, end: Dayjs) => {
        let total = 0;
        let current = start.startOf('day');

        while (current.isBefore(end)) {
            const dayStart = current.hour(START_HOUR).minute(0);
            const dayEnd = current.hour(END_HOUR).minute(0);

            const rangeStart = dayStart.isBefore(start) ? start : dayStart;
            const rangeEnd = dayEnd.isAfter(end) ? end : dayEnd;

            if (rangeEnd.isAfter(rangeStart)) {
                let minutes = rangeEnd.diff(rangeStart, 'minute');

                const startM = toMinutes(rangeStart);
                const endM = toMinutes(rangeEnd);

                if (startM < LUNCH_END && endM > LUNCH_START) {
                    minutes -= LUNCH_END - LUNCH_START;
                }

                total += minutes;
            }

            current = current.add(1, 'day');
        }

        return total;
    };

    const isCandidateAlreadyScheduled = (candidateId: string, currentEventId?: string) => {
        return schedule.some((ev) => ev.candidate?.id === candidateId && ev.id !== currentEventId);
    };

    const isDuplicateCandidate = (candidateId, start, end, currentId) => {
        return schedule.some((ev) => {
            if (ev.id === currentId) return false;
            if (ev.status === 'cancelled') return false;
            if (ev.candidate?.id !== candidateId) return false;

            const s = dayjs(ev.start);
            const e = dayjs(ev.end);

            return start.isBefore(e) && end.isAfter(s);
        });
    };

    const isConflictGlobal = (start: Dayjs, end: Dayjs, department?: string) => {
        return schedule.some((ev) => {
            const s = dayjs(ev.start);
            const e = dayjs(ev.end);
            if (ev.status === 'cancelled') return false;
            if (department && ev.candidate?.job?.department !== department) return false;

            return start.isBefore(e) && end.isAfter(s);
        });
    };

    const reloadAll = async () => {
        try {
            const [candidateRes, interviewRes] = await Promise.all([
                http.get('/candidates', {
                    params: {
                        status: 'cv_dat',
                        page: 1,
                        pageSize: 200,
                        department: department === 'ALL' ? undefined : department
                    }
                }),
                http.get('/interviews')
            ]);

            setCandidates(candidateRes?.hits || candidateRes?.data || []);
            setSchedule(interviewRes?.hits || interviewRes?.data || []);
        } catch (err) {
            notify.error(getErrorMessage(err));
        }
    };

    const generateSchedule = async () => {
        if (!selectedCandidates.length) {
            notify.warning('Chọn ứng viên');
            return;
        }

        if (!timeRange) {
            notify.warning('Chọn khoảng thời gian');
            return;
        }

        const [start, end] = timeRange;

        const now = dayjs();
        let safeStart = start;

        const roundTo5 = (d: Dayjs) => {
            const m = d.minute();
            const rounded = Math.ceil(m / 5) * 5;
            return d.minute(rounded).second(0);
        };

        if (safeStart.isSame(now, 'day') && safeStart.isBefore(now)) {
            safeStart = roundTo5(now);
        }

        const selected = candidates.filter(
            (c) => selectedCandidates.includes(c.id) && !schedule.some((ev) => ev.candidate?.id === c.id)
        );

        if (!selected.length) {
            notify.warning('Tất cả ứng viên được chọn đã được xếp lịch trước đó');
            return;
        }

        const workingTime = calculateWorkingMinutes(start, end);

        const totalTime = selected.length * duration + (selected.length - 1) * interval;

        if (workingTime < totalTime) {
            notify.error('Không đủ thời gian');
            return;
        }

        let hasConflict = false;
        const result: any[] = [];
        const isConflictAll = (start: Dayjs, end: Dayjs) => {
            return [...schedule.filter((ev) => ev.status !== 'cancelled'), ...result].some((ev) => {
                const s = dayjs(ev.start);
                const e = dayjs(ev.end);
                return start.isBefore(e) && end.isAfter(s);
            });
        };

        for (const c of selected) {
            let current = safeStart.clone();

            while (current.isBefore(end)) {
                if (current.isSame(dayjs(), 'day') && current.isBefore(dayjs())) {
                    current = dayjs().add(5, 'minute');
                    continue;
                }

                if (current.hour() < START_HOUR) {
                    current = current.hour(START_HOUR).minute(0);
                    continue;
                }

                if (current.hour() >= END_HOUR) {
                    current = current.add(1, 'day').hour(START_HOUR).minute(0);
                    continue;
                }

                const currentM = toMinutes(current);

                if (currentM >= LUNCH_START && currentM < LUNCH_END) {
                    current = current.hour(13).minute(30);
                    continue;
                }

                const endTime = current.add(duration, 'minute');

                if (endTime.hour() >= END_HOUR) {
                    current = current.add(1, 'day').hour(START_HOUR).minute(0);
                    continue;
                }

                const nextStart = endTime.add(interval, 'minute');

                const isBlocked = [...schedule.filter((ev) => ev.status !== 'cancelled'), ...result].some((ev) => {
                    const s = dayjs(ev.start);
                    const e = dayjs(ev.end);

                    return current.isBefore(e.add(interval, 'minute')) && nextStart.isAfter(s);
                });

                if (isBlocked) {
                    current = current.add(5, 'minute');
                    continue;
                }

                result.push({
                    id: crypto.randomUUID(),
                    title: c.fullName || c.name,
                    candidate: c,
                    start: current.toDate(),
                    end: endTime.toDate()
                });

                break;
            }
        }
        if (!result.length) {
            notify.error('Không tìm được khung giờ phù hợp');
            return;
        }

        if (hasConflict) {
            notify.warning('Một số khung giờ bị trùng, hệ thống đã tự động dời lịch');
        }

        try {
            await Promise.all(
                result.map((item) =>
                    http.post('/interviews', {
                        candidateId: item.candidate.id,
                        jobId: item.candidate?.job?.id,
                        interviewDate: dayjs(item.start).format('YYYY-MM-DD'),
                        interviewTime: dayjs(item.start).format('HH:mm'),
                        durationMinutes: duration,
                        location: '',
                        infoMeeting: 'Không có thông tin',
                        start: item.start,
                        end: item.end
                    })
                )
            );

            const res = await http.get('/interviews');
            setSchedule(res?.hits || []);

            setCurrentWeek(start);

            notify.success('Xếp lịch thành công');
        } catch (err) {
            notify.error(getErrorMessage(err));
        }
    };

    /* ===== WEEK ===== */
    const days: Dayjs[] = [];
    let current = currentWeek;

    while (days.length < 5) {
        if (current.day() !== 0 && current.day() !== 6) {
            days.push(current);
        }
        current = current.add(1, 'day');
    }
    const isConflict = (newStart, newEnd, currentId) => {
        return schedule.some((ev) => {
            if (ev.id === currentId) return false;

            if (ev.candidate?.job?.department !== selectedEvent?.candidate?.job?.department) {
                return false;
            }

            const start = dayjs(ev.start);
            const end = dayjs(ev.end);

            return newStart.isBefore(end) && newEnd.isAfter(start);
        });
    };

    const handleUpdate = async (values: any) => {
        if (!selectedEvent) return;

        const newStart = values.date.hour(values.time.hour()).minute(values.time.minute());

        const newEnd = newStart.add(values.duration, 'minute');

        if (isConflict(newStart, newEnd, selectedEvent.id)) {
            notify.error('Lịch bị trùng với ứng viên khác!');
            return;
        }

        const isDup = isDuplicateCandidate(values.candidateId, newStart, newEnd, selectedEvent.id);

        const doUpdate = async () => {
            try {
                await http.patch(`/interviews/${selectedEvent.id}`, {
                    candidateId: values.candidateId,
                    interviewDate: newStart.format('YYYY-MM-DD'),
                    interviewTime: newStart.format('HH:mm'),
                    durationMinutes: values.duration,
                    format: values.type === 'Online' ? 'online' : 'in_person',
                    infoMeeting: values.infoMeeting,
                    notes: values.note,
                    start: newStart.toISOString(),
                    end: newEnd.toISOString()
                });

                notify.success('Cập nhật thành công');

                const res = await http.get('/interviews');
                setSchedule(res.hits || res.data || []);

                setSelectedEvent(null);
                form.resetFields();
            } catch (err: any) {
                console.log(err);
                notify.error(getErrorMessage(err));
            }
        };

        if (isDup) {
            Modal.confirm({
                title: 'Ứng viên đã có lịch',
                content: 'Ứng viên đã có lịch phỏng vấn, bạn có chắc chắn muốn cập nhật không?',
                okText: 'Vẫn cập nhật',
                cancelText: 'Hủy',
                onOk: doUpdate
            });
        } else {
            await doUpdate();
        }
    };

    /* ===== DRAG ===== */
    const handleDrop = async (e: any, day: Dayjs) => {
        try {
            const id = e.dataTransfer.getData('eventId');

            const event = schedule.find((ev) => ev.id === id);
            if (!event) return;

            const rect = e.currentTarget.getBoundingClientRect();
            const offsetY = e.clientY - rect.top;

            const totalMinutes = Math.floor(offsetY);
            const hour = Math.floor(totalMinutes / 60) + START_HOUR;
            const minute = Math.round((totalMinutes % 60) / 5) * 5;

            const newStart = day.hour(hour).minute(minute);
            const duration = dayjs(event.end).diff(dayjs(event.start), 'minute');
            const newEnd = newStart.add(duration, 'minute');

            const isConflictDrop = schedule.some((ev) => {
                if (ev.id === id) return false;
                if (ev.status === 'cancelled') return false;
                if (ev.candidate?.job?.department !== event?.candidate?.job?.department) {
                    return false;
                }

                const s = dayjs(ev.start);
                const e = dayjs(ev.end);

                return newStart.isBefore(e) && newEnd.isAfter(s);
            });

            if (isConflictDrop) {
                notify.error('Khung giờ bị trùng!');
                return;
            }

            if (day.isSame(dayjs(), 'day') && newStart.isBefore(dayjs())) {
                notify.warning('Không thể đặt lịch trong quá khứ');
                return;
            }
            const isDup = schedule.some((ev) => {
                if (ev.id === id) return false;

                if (ev.candidate?.id !== event.candidate?.id) return false;

                const s = dayjs(ev.start);
                const e = dayjs(ev.end);

                return newStart.isBefore(e) && newEnd.isAfter(s);
            });

            if (isDup) {
                notify.warning('Ứng viên đã có lịch trùng giờ');
                return;
            }

            await http.patch(`/interviews/${id}`, {
                start: newStart.toISOString(),
                end: newEnd.toISOString(),
                interviewDate: newStart.format('YYYY-MM-DD'),
                interviewTime: newStart.format('HH:mm'),
                durationMinutes: duration,
                infoMeeting: event.infoMeeting
            });

            const res = await http.get('/interviews');
            console.log('hehe', res);
            setSchedule(res.hits || res.data || []);

            notify.success('Cập nhật lịch thành công');
        } catch (err) {
            console.log(err);
            notify.error(getErrorMessage(err));
        }
    };

    /* ===== CREATE ===== */
    const handleCreate = (e: any, day: Dayjs) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const offsetY = e.clientY - rect.top;

        const hour = Math.floor(offsetY / 60) + START_HOUR;

        const newEvent = {
            id: Date.now(),
            title: 'New',
            start: day.hour(hour).toDate(),
            end: day.hour(hour + 1).toDate()
        };

        setSchedule((prev) => [...prev, newEvent]);
    };

    const now = dayjs();

    const isReadonly = selectedEvent?.status === 'completed' || selectedEvent?.status === 'cancelled';
    return (
        <Row gutter={24}>
            <Col span={8}>
                <Card
                    title='Ứng viên'
                    styles={{
                        body: {
                            display: 'flex',
                            flexDirection: 'column',
                            height: 600
                        }
                    }}
                >
                    <div style={{ position: 'sticky', top: 0, zIndex: 2, background: '#fff' }}>
                        <DepartmentSelect
                            value={department}
                            onChange={setDepartment}
                            style={{ width: '100%', marginBottom: 12 }}
                        />

                        <div
                            style={{
                                marginBottom: 12,
                                display: 'flex',
                                gap: 8,
                                flexWrap: 'wrap'
                            }}
                        >
                            <InputNumber
                                addonBefore='Thời gian PV'
                                value={duration}
                                onChange={(v) => setDuration(v || 30)}
                                style={{
                                    flex: '1 1 40%'
                                }}
                            />

                            <InputNumber
                                addonBefore='Khoảng cách'
                                value={interval}
                                onChange={(v) => setInterval(v || 10)}
                                style={{
                                    flex: '1 1 40%'
                                }}
                            />
                        </div>
                        <Row gutter={8}>
                            <Col span={24}>
                                <DatePicker
                                    showTime={{ format: 'HH:mm' }}
                                    format='DD/MM/YYYY HH:mm'
                                    style={{ width: '100%', marginBottom: 12 }}
                                    placeholder='Chọn thời gian bắt đầu'
                                    disabledDate={(current) => {
                                        const today = dayjs().startOf('day');

                                        return current < today || current.day() === 0 || current.day() === 6;
                                    }}
                                    disabledTime={(date) => {
                                        if (!date) return {};

                                        const now = dayjs();

                                        return {
                                            disabledHours: () =>
                                                Array.from({ length: 24 }, (_, i) => i).filter(
                                                    (h) => h < START_HOUR || h > END_HOUR
                                                ),

                                            disabledMinutes: (selectedHour) => {
                                                if (date.isSame(now, 'day') && selectedHour === now.hour()) {
                                                    return Array.from({ length: 60 }, (_, i) => i).filter(
                                                        (m) => m < now.minute()
                                                    );
                                                }
                                                return [];
                                            }
                                        };
                                    }}
                                    onChange={(v) => {
                                        if (!v) return;

                                        const start = v;
                                        const end = v.add(100, 'day');

                                        setTimeRange([start, end]);
                                    }}
                                />
                            </Col>
                        </Row>
                    </div>
                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        items={[
                            { key: 'all', label: 'Tất cả' },
                            { key: 'pending', label: 'Chờ lên lịch' },
                            { key: 'scheduled', label: 'Đã lên lịch' },
                            { key: 'completed', label: 'Xác nhận' },
                            { key: 'cancelled', label: 'Hủy' }
                        ]}
                    />
                    {/* LIST SCROLL */}
                    <div style={{ flex: 1, overflow: 'auto' }}>
                        <List
                            dataSource={candidates}
                            renderItem={(item: any) => (
                                <List.Item
                                    key={item.id}
                                    style={{
                                        padding: 12,
                                        display: 'flex',
                                        justifyContent: 'flex-start',
                                        position: 'relative',
                                        cursor: isCandidateScheduled(item.id) ? 'not-allowed' : 'pointer',
                                        background: selectedCandidates.includes(item.id) ? '#e6f7ff' : 'transparent',
                                        opacity: isCandidateScheduled(item.id) ? 0.5 : 1
                                    }}
                                    onClick={() => {
                                        if (isCandidateScheduled(item.id)) {
                                            notify.warning('Ứng viên này đã có lịch phỏng vấn');
                                            return;
                                        }

                                        setSelectedCandidates((prev) =>
                                            prev.includes(item.id)
                                                ? prev.filter((i) => i !== item.id)
                                                : [...prev, item.id]
                                        );
                                    }}
                                >
                                    <Checkbox
                                        checked={selectedCandidates.includes(item.id)}
                                        disabled={isCandidateScheduled(item.id)}
                                    />
                                    <Avatar
                                        src={item.avatarUrl || item.avatar}
                                        style={{ margin: '0 8px', marginRight: '20px' }}
                                    />
                                    <div>
                                        <Text strong>{item.fullName || item.name}</Text>
                                        <br />
                                        <Text type='secondary'>{item.job?.title}</Text>
                                    </div>
                                    {(() => {
                                        const events = getCandidateSchedules(item.id);

                                        if (!events.length) return null;

                                        const first = dayjs(events[0].start);

                                        return (
                                            <Tag
                                                color='blue'
                                                style={{
                                                    position: 'absolute',
                                                    top: 8,
                                                    right: 8,
                                                    borderRadius: 12
                                                }}
                                            >
                                                <CalendarTwoTone style={{ fontSize: 14 }} />{' '}
                                                {first.format('DD/MM HH:mm')}
                                                {events.length > 1 && ` (+${events.length - 1})`}
                                            </Tag>
                                        );
                                    })()}
                                </List.Item>
                            )}
                        />
                    </div>

                    <div style={{ marginTop: 12 }}>
                        <Button type='primary' block disabled={!department} onClick={generateSchedule}>
                            Xếp lịch tự động
                        </Button>
                    </div>
                </Card>
            </Col>

            <Col span={16}>
                <Card title='Lịch phỏng vấn'>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                            <Button onClick={() => setCurrentWeek((p) => p.subtract(1, 'week'))}>‹</Button>

                            <Button onClick={() => setCurrentWeek(getValidStartDay())}>Hôm nay</Button>

                            <Button onClick={() => setCurrentWeek((p) => p.add(1, 'week'))}>›</Button>
                        </div>

                        <div style={{ marginLeft: 12, fontWeight: 600 }}>
                            {days[0]?.format('DD/MM')} - {days[4]?.format('DD/MM/YYYY')}
                        </div>

                        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                            {/* <Tag color='green'>{schedule.length} lịch</Tag>
                            <Tag color='gold'>{selectedCandidates.length} chọn</Tag> */}
                        </div>
                    </div>

                    <div style={{ border: '1px solid #eee', borderRadius: 12, overflow: 'hidden' }}>
                        <div style={{ display: 'flex', borderBottom: '1px solid #eee', background: '#fafafa' }}>
                            <div style={{ width: 80, height: 42, borderRight: '1px solid #eee' }} />

                            <div style={{ flex: 1, display: 'flex' }}>
                                {days.slice(0, 5).map((day) => (
                                    <div
                                        key={day.toString()}
                                        style={{
                                            flex: 1,
                                            textAlign: 'center',
                                            padding: '6px 0',
                                            borderLeft: '1px solid #eee'
                                        }}
                                    >
                                        <div style={{ fontSize: 12, color: '#888' }}>
                                            {day.format('ddd').toUpperCase()}
                                        </div>
                                        <div style={{ fontWeight: 600 }}>{day.format('DD')}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', height: 558 }}>
                            <div style={{ width: 80, background: '#fafafa' }}>
                                {HOURS.map((h) => (
                                    <div key={h} style={{ height: 60, padding: 6 }}>
                                        {h}:00
                                    </div>
                                ))}
                            </div>

                            <div style={{ flex: 1, display: 'flex' }}>
                                {days.slice(0, 5).map((day) => {
                                    const dayEvents = schedule.filter(
                                        (e) =>
                                            e.status !== 'cancelled' &&
                                            dayjs(e.start).format('YYYY-MM-DD') === day.format('YYYY-MM-DD')
                                    );

                                    return (
                                        <div
                                            key={day.toString()}
                                            style={{ flex: 1, borderLeft: '1px solid #eee', position: 'relative' }}
                                            onDrop={(e) => handleDrop(e, day)}
                                            onDragOver={(e) => e.preventDefault()}
                                            onDoubleClick={(e) => {
                                                const rect = e.currentTarget.getBoundingClientRect();
                                                const offsetY = e.clientY - rect.top;

                                                const hour = Math.floor(offsetY / 60) + START_HOUR;
                                                const minute = Math.round((offsetY % 60) / 5) * 5;

                                                const clickedTime = day.hour(hour).minute(minute);

                                                if (day.isSame(dayjs(), 'day') && clickedTime.isBefore(dayjs())) {
                                                    return;
                                                }

                                                handleCreate(e, day);
                                            }}
                                        >
                                            <div>
                                                {HOURS.map((h) => (
                                                    <div
                                                        key={h}
                                                        style={{ height: 60, borderTop: '1px solid #f0f0f0' }}
                                                    />
                                                ))}
                                            </div>

                                            {day.isSame(now, 'day') && (
                                                <div
                                                    style={{
                                                        position: 'absolute',
                                                        top: (now.hour() - START_HOUR) * 60 + now.minute(),
                                                        left: 0,
                                                        right: 0,
                                                        height: 2,
                                                        background: 'red'
                                                    }}
                                                />
                                            )}

                                            {/* EVENTS */}
                                            {dayEvents.map((event) => {
                                                const start = dayjs(event.start);
                                                const end = dayjs(event.end);

                                                return (
                                                    <Tooltip
                                                        title={
                                                            <div>
                                                                <div>
                                                                    <b>{event.candidate?.fullName || event.title}</b>
                                                                </div>
                                                                <div>{event.candidate?.email || 'no-email'}</div>
                                                            </div>
                                                        }
                                                    >
                                                        <div
                                                            key={event.id}
                                                            draggable
                                                            onDragStart={(e) =>
                                                                e.dataTransfer.setData('eventId', event.id)
                                                            }
                                                            onContextMenu={(e) => {
                                                                e.preventDefault();

                                                                setContextMenu({
                                                                    x: e.clientX,
                                                                    y: e.clientY,
                                                                    event
                                                                });
                                                            }}
                                                            onClick={() => {
                                                                setSelectedEvent(event);
                                                                setSelectedCandidateId(event.candidate?.id);

                                                                form.setFieldsValue({
                                                                    date: dayjs(event.start),
                                                                    time: dayjs(event.start),
                                                                    duration: dayjs(event.end).diff(
                                                                        dayjs(event.start),
                                                                        'minute'
                                                                    ),
                                                                    type:
                                                                        event.format === 'online'
                                                                            ? 'Online'
                                                                            : 'Offline',
                                                                    status: event.status || 'Scheduled',
                                                                    infoMeeting: event.infoMeeting || '',
                                                                    note: event.notes || ''
                                                                });
                                                            }}
                                                            style={{
                                                                position: 'absolute',
                                                                top: (start.hour() - START_HOUR) * 60 + start.minute(),
                                                                left: 6,
                                                                right: 6,
                                                                height: end.diff(start, 'minute'),
                                                                background: getColor(event.status),
                                                                border: '1px solid #91caff',
                                                                borderRadius: 10,
                                                                padding: 6,
                                                                fontSize: 12,
                                                                cursor: 'move',
                                                                boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
                                                            }}
                                                        >
                                                            <b>
                                                                {start.format('HH:mm')} - {end.format('HH:mm')}
                                                            </b>
                                                        </div>
                                                    </Tooltip>
                                                );
                                            })}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </Card>
            </Col>

            {contextMenu && (
                <div
                    style={{
                        position: 'fixed',
                        top: contextMenu.y,
                        left: contextMenu.x,
                        background: '#fff',
                        border: '1px solid #eee',
                        borderRadius: 10,
                        boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
                        zIndex: 9999,
                        width: 220,
                        overflow: 'hidden'
                    }}
                    onMouseLeave={() => setContextMenu(null)}
                >
                    {/* CONFIRM */}
                    <div
                        style={{
                            padding: '10px 14px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10
                        }}
                        onClick={() => {
                            handleConfirm(contextMenu.event);
                            setContextMenu(null);
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f5')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                        <CheckCircleOutlined style={{ color: '#16a34a', fontSize: 16 }} />
                        <span>Xác nhận tham gia</span>
                    </div>

                    {/* REJECT */}
                    <div
                        style={{
                            padding: '10px 14px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            color: '#dc2626'
                        }}
                        onClick={() => {
                            handleRejectInterview(contextMenu.event);
                            setContextMenu(null);
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#fff1f0')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                        <CloseCircleOutlined style={{ fontSize: 16 }} />
                        <span>Từ chối phỏng vấn</span>
                    </div>
                </div>
            )}
            {/* MODAL */}
            <Modal
                open={!!selectedEvent}
                onCancel={() => {
                    setSelectedEvent(null);
                    form.resetFields();
                }}
                onOk={() => {
                    if (!isReadonly) form.submit();
                }}
                okText={isReadonly ? 'Đóng' : 'Cập nhật'}
                okButtonProps={{
                    disabled: isReadonly
                }}
                title='Cập nhật lịch phỏng vấn'
            >
                <Form form={form} layout='vertical' onFinish={handleUpdate} disabled={isReadonly}>
                    {/* <Form.Item
                        label='Ứng viên'
                        name='candidateId'
                        rules={[{ required: true, message: 'Chọn ứng viên' }]}
                        initialValue={selectedCandidateId}
                    >
                        <Select
                            options={candidates.map((c) => ({
                                label: c.fullName || c.name,
                                value: c.id
                            }))}
                            onChange={setSelectedCandidateId}
                        />
                    </Form.Item> */}

                    <Row gutter={12}>
                        <Col span={12}>
                            <Form.Item label='Ngày' name='date' rules={[{ required: true, message: 'Chọn ngày' }]}>
                                <DatePicker
                                    style={{ width: '100%' }}
                                    placeholder='Chọn ngày'
                                    disabledDate={(current) => {
                                        if (!current) return false;

                                        const today = dayjs().startOf('day');

                                        if (current < today) return true;

                                        if (current.day() === 0 || current.day() === 6) return true;

                                        return false;
                                    }}
                                />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item label='Giờ' name='time' rules={[{ required: true, message: 'Chọn giờ' }]}>
                                <TimePicker
                                    style={{ width: '100%' }}
                                    format='HH:mm'
                                    placeholder='Chọn giờ'
                                    disabledTime={(date) => {
                                        const now = dayjs();

                                        return {
                                            disabledHours: () =>
                                                Array.from({ length: 24 }, (_, i) => i).filter(
                                                    (h) =>
                                                        h < START_HOUR ||
                                                        h >= END_HOUR ||
                                                        (date?.isSame(now, 'day') && h < now.hour())
                                                ),

                                            disabledMinutes: (selectedHour) => {
                                                if (date?.isSame(now, 'day') && selectedHour === now.hour()) {
                                                    return Array.from({ length: 60 }, (_, i) => i).filter(
                                                        (m) => m < now.minute()
                                                    );
                                                }
                                                return [];
                                            }
                                        };
                                    }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={12}>
                        <Col span={8}>
                            <Form.Item
                                label='Thời lượng'
                                name='duration'
                                rules={[{ required: true, message: 'Nhập phút' }]}
                            >
                                <InputNumber style={{ width: '100%' }} addonBefore='Phút' />
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item label='Hình thức' name='type' rules={[{ required: true }]}>
                                <Select
                                    options={[
                                        { label: 'Online', value: 'Online' },
                                        { label: 'Offline', value: 'Offline' }
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        label='Thông tin phỏng vấn'
                        name='infoMeeting'
                        rules={[{ required: true, message: 'Bắt buộc nhập thông tin phỏng vấn' }]}
                    >
                        <Input placeholder='Link meet hoặc địa điểm' />
                    </Form.Item>

                    <Form.Item label='Ghi chú' name='note'>
                        <Input.TextArea />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                open={!!contextEvent}
                onCancel={() => setContextEvent(null)}
                onOk={async () => {
                    try {
                        await http.delete(`/interviews/${contextEvent.id}`);

                        const res = await http.get('/interviews');
                        setSchedule(res?.hits || res?.data || []);

                        notify.success('Đã xóa lịch phỏng vấn');
                    } catch (err) {
                        notify.error(getErrorMessage(err));
                    } finally {
                        setContextEvent(null);
                    }
                }}
                title='Xóa lịch phỏng vấn'
                okText='Xóa'
                cancelText='Hủy'
            >
                Bạn có chắc muốn xóa lịch phỏng vấn này không?
            </Modal>
        </Row>
    );
};
