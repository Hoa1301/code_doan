import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { BaseService } from '../../../common/services/base.service';
import { Evaluation } from '../entities/evaluation.entity';
import { CreateEvaluationDto, UpdateEvaluationDto } from '../dto/evaluation.dto';

@Injectable()
export class EvaluationService extends BaseService<Evaluation> {
  constructor(
    @InjectRepository(Evaluation)
    private readonly evaluationRepository: Repository<Evaluation>,
  ) {
    super(evaluationRepository);
  }

  // Logic tính điểm overallScore tự động
  async create(data: CreateEvaluationDto): Promise<Evaluation> {
    const normalizedType = this.normalizePhaseType(data.type);
    const overallScore =
      data.overallScore !== undefined && data.overallScore !== null ? Number(data.overallScore) : this.calculateOverallScore(data);
    const existingEvaluation = await this.findLatestByInternAndType(data.internId, normalizedType);

    if (existingEvaluation) {
      Object.assign(existingEvaluation, {
        ...data,
        type: normalizedType,
        overallScore,
        status: data.status ?? existingEvaluation.status ?? 'completed',
      });

      return this.evaluationRepository.save(existingEvaluation);
    }

    return super.create({
      ...data,
      type: normalizedType,
      overallScore,
      status: data.status ?? 'completed',
    } as any);
  }

  async update(id: string, data: UpdateEvaluationDto): Promise<Evaluation> {
    if (
      data.overallScore !== undefined ||
      data.technicalScore !== undefined ||
      data.attitudeScore !== undefined ||
      data.teamworkScore !== undefined ||
      data.progressScore !== undefined
    ) {
      const evaluation = await this.findOne(id);
      const mergedData = { ...evaluation, ...data };
      const overallScore =
        mergedData.overallScore !== undefined && mergedData.overallScore !== null
          ? Number(mergedData.overallScore)
          : this.calculateOverallScore(mergedData);
      return super.update(id, { ...data, overallScore } as any);
    }
    return super.update(id, data as any);
  }

  async updateDecision(id: string, decision: string, reason: string): Promise<Evaluation> {
    return this.update(id, { decision, decisionReason: reason, status: 'completed' } as any);
  }

  async findByIntern(internId: string): Promise<Evaluation[]> {
    const evaluations = await this.evaluationRepository.find({
      where: { internId },
      relations: ['mentor'],
      order: { updatedAt: 'DESC' },
    });

    const phaseMap = new Map<string, Evaluation>();

    evaluations.forEach((evaluation) => {
      const normalizedType = this.normalizePhaseType(evaluation.type);
      evaluation.type = normalizedType;
      const existing = phaseMap.get(normalizedType);
      if (!existing || this.shouldReplacePhaseEvaluation(existing, evaluation)) {
        phaseMap.set(normalizedType, evaluation);
      }
    });

    return Array.from(phaseMap.values()).sort(
      (left, right) => this.getPhaseOrder(left.type) - this.getPhaseOrder(right.type),
    );
  }

  private async findLatestByInternAndType(internId: string, type: string): Promise<Evaluation | null> {
    const aliases = this.getPhaseTypeAliases(type);

    return this.evaluationRepository.findOne({
      where: { internId, type: In(aliases) },
      order: { updatedAt: 'DESC' },
    });
  }

  private shouldReplacePhaseEvaluation(current: Evaluation, candidate: Evaluation): boolean {
    if (candidate.status === 'draft' && current.status !== 'draft') {
      return true;
    }

    if (candidate.status !== 'draft' && current.status === 'draft') {
      return false;
    }

    return new Date(candidate.updatedAt).getTime() > new Date(current.updatedAt).getTime();
  }

  private getPhaseOrder(type: string): number {
    const orderMap: Record<string, number> = {
      Probation: 0,
      'Mid-term': 1,
      Final: 2,
    };

    return orderMap[type] ?? Number.MAX_SAFE_INTEGER;
  }

  private normalizePhaseType(type: string): string {
    const normalized = String(type || '')
      .trim()
      .toLowerCase();

    if (['probation', 'phase1', 'phase_1', 'trial', 'gd1', 'giai-doan-1'].includes(normalized)) {
      return 'Probation';
    }

    if (['mid-term', 'midterm', 'phase2', 'phase_2', 'project', 'gd2', 'giai-doan-2'].includes(normalized)) {
      return 'Mid-term';
    }

    if (['final', 'final-term', 'phase3', 'phase_3', 'gd-cuoi', 'giai-doan-cuoi'].includes(normalized)) {
      return 'Final';
    }

    return type;
  }

  private getPhaseTypeAliases(type: string): string[] {
    const normalizedType = this.normalizePhaseType(type);

    if (normalizedType === 'Probation') {
      return ['Probation', 'phase1'];
    }

    if (normalizedType === 'Mid-term') {
      return ['Mid-term', 'phase2'];
    }

    if (normalizedType === 'Final') {
      return ['Final', 'final'];
    }

    return [type];
  }

  private calculateOverallScore(data: any): number {
    const scores = [data.technicalScore, data.attitudeScore, data.teamworkScore, data.progressScore].filter(
      (s) => s !== undefined && s !== null,
    );

    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((a, b) => Number(a) + Number(b), 0) / scores.length);
  }
}
