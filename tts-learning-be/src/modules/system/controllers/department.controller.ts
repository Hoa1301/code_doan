import { Controller, Get } from '@nestjs/common';
import { DepartmentService } from '../services/department.service';

@Controller('departments')
export class DepartmentController {
  constructor(private service: DepartmentService) {}

  @Get()
  findAll() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.service.findAll();
  }
}