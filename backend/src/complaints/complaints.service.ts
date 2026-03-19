import { Injectable } from '@nestjs/common';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintDto } from './dto/update-complaint.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Complaint } from './entities/complaint.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ComplaintsService {
  constructor(
    @InjectRepository(Complaint)
    private complaintRepository: Repository<Complaint>,
  ) {}
  async create(createComplaintDto: CreateComplaintDto) {
    const complaint = this.complaintRepository.create(createComplaintDto);
    return await this.complaintRepository.save(complaint);
  }

  findAll() {
    return this.complaintRepository.find();
  }
  async findOneByUserId(userId: number) {
    return await this.complaintRepository.findOneBy({ userId });
  }

  findOne(id: number) {
    return this.complaintRepository.findOneBy({ id });
  }

  async update(id: number, updateComplaintDto: UpdateComplaintDto) {
    const complaint = await this.complaintRepository.findOneBy({ id });
    if (!complaint) return null;

    await this.complaintRepository.update(id, updateComplaintDto);
    return await this.complaintRepository.findOneBy({ id });
  }

  async remove(id: number) {
    const complaint = await this.complaintRepository.delete(id);
    return complaint.affected !== 0;
  }
}
