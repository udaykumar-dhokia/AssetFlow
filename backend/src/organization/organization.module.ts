import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { DepartmentController } from './department.controller';
import { CategoryController } from './category.controller';
import { EmployeeController } from './employee.controller';
import { DepartmentService } from './department.service';
import { CategoryService } from './category.service';
import { EmployeeService } from './employee.service';

@Module({
  imports: [SharedModule],
  controllers: [DepartmentController, CategoryController, EmployeeController],
  providers: [DepartmentService, CategoryService, EmployeeService],
})
export class OrganizationModule {}
