import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  create(@Body() createAttendanceDto: CreateAttendanceDto) {
    return this.attendanceService.create(createAttendanceDto);
  }

  @Post('mark-session')
  markSession(@Body() markAttendanceDto: MarkAttendanceDto) {
    return this.attendanceService.markAttendanceForSession(markAttendanceDto);
  }

  @Get()
  findAll() {
    return this.attendanceService.findAll();
  }

  @Get('statistics')
  getStatistics(
    @Query('groupId') groupId?: string,
    @Query('studentId') studentId?: string,
  ) {
    return this.attendanceService.getStatistics(
      groupId ? +groupId : undefined,
      studentId ? +studentId : undefined,
    );
  }

  @Get('group/:groupId')
  findByGroup(@Param('groupId') groupId: string) {
    return this.attendanceService.findByGroup(+groupId);
  }

  @Get('student/:studentId')
  findByStudent(@Param('studentId') studentId: string) {
    return this.attendanceService.findByStudent(+studentId);
  }

  @Get('date/:date')
  findByDate(@Param('date') date: string) {
    return this.attendanceService.findByDate(date);
  }

  @Get('group/:groupId/date/:date')
  findByGroupAndDate(
    @Param('groupId') groupId: string,
    @Param('date') date: string,
  ) {
    return this.attendanceService.findByGroupAndDate(+groupId, date);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attendanceService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAttendanceDto: UpdateAttendanceDto) {
    return this.attendanceService.update(+id, updateAttendanceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.attendanceService.remove(+id);
  }
}