import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ContactSetting } from './entities/contact.entities';
import { Repository } from 'typeorm';
import { ContactLogger } from './contact.logger';
import { UpdateContactSettingsDTO } from './dto/contact.dto';

@Injectable()
export class ContactService {
    constructor(
        private readonly contactLogger: ContactLogger,

        @InjectRepository(ContactSetting)
        private readonly contactSettingRepository: Repository<ContactSetting>,
    ) {}

    // Lấy thời gian hiện tại
    private getCurrentTime() {
        return new Date().toLocaleString("vi-VN", {
            timeZone: "Asia/Ho_Chi_Minh"
        })
    }

    // Lấy contact hiện tại
    async getContactSettings() {
        const setting = await this.contactSettingRepository.findOne({
            where: {},
            order: {id: "ASC"}
        })

        if (!setting) {
            throw new NotFoundException("Contact setting not found")
        }   

        this.contactLogger.log(`Get contact setting successfully at ${this.getCurrentTime()}`)

        return setting
    }

    // Cập nhật contact
    async updateContactSettings(updateContactSettingsDto: UpdateContactSettingsDTO) {
        const setting = await this.contactSettingRepository.findOne({
            where: {},
            order: { id: "ASC" }
        })

        if (!setting) {
            throw new NotFoundException("Contact setting not found")
        }

        // Chỉ cập nhật các trường được gửi lên
        if (updateContactSettingsDto.hotline !== undefined) {
            setting.hotline = updateContactSettingsDto.hotline
        }

        if (updateContactSettingsDto.zalo !== undefined) {
            setting.zalo = updateContactSettingsDto.zalo
        }

        if (updateContactSettingsDto.messenger !== undefined) {
            setting.messenger = updateContactSettingsDto.messenger
        }

        if (updateContactSettingsDto.email !== undefined) {
            setting.email = updateContactSettingsDto.email
        }

        setting.updated_at = new Date()

        this.contactLogger.log(`Update contact settings successfullt at ${this.getCurrentTime()}`)

        return await this.contactSettingRepository.save(setting)
    }
}
