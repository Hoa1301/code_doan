import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../auth/entities/user.entity';
import { Intern } from '../../training/entities/intern.entity';

@Entity('evaluations')
export class Evaluation extends BaseEntity {
  @ManyToOne(() => Intern, (intern) => intern.evaluations)
  @JoinColumn({ name: 'intern_id' })
  intern: Intern;

  @Column({ name: 'intern_id', type: 'uuid' })
  internId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'mentor_id' })
  mentor: User;

  @Column({ name: 'mentor_id', type: 'uuid' })
  mentorId: string;

  @Column()
  type: string; // phase1, phase2, final

  @Column({ name: 'evaluation_date', type: 'date', default: () => 'CURRENT_DATE' })
  evaluationDate: Date;

  @Column({ name: 'technical_score', type: 'float', nullable: true })
  technicalScore: number | null;

  @Column({ name: 'attitude_score', type: 'float', nullable: true })
  attitudeScore: number | null;

  @Column({ name: 'teamwork_score', type: 'float', nullable: true })
  teamworkScore: number | null;

  @Column({ name: 'progress_score', type: 'float', nullable: true })
  progressScore: number | null;

  @Column({ name: 'overall_score', type: 'float', nullable: true })
  overallScore: number | null;

  @Column({ type: 'text', nullable: true })
  strengths: string | null;

  @Column({ type: 'text', nullable: true })
  weaknesses: string | null;

  @Column({ type: 'text', nullable: true })
  feedback: string | null;

  @Column({ type: 'varchar', nullable: true })
  decision: string | null; // propose_hire, extend_internship, end_program

  @Column({ name: 'decision_reason', type: 'text', nullable: true })
  decisionReason: string | null;

  @Column({ default: 'completed' })
  status: string; // draft, completed
}
