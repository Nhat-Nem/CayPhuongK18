import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ContactSetting } from "./entities/contact.entities";
import { Repository } from "typeorm";
import { ContactLogger } from "./contact.logger";
import { UpdateContactSettingsDTO } from "./dto/contact.dto";

@Injectable()
export class ContactService {
  constructor(
    private readonly contactLogger: ContactLogger,

    @InjectRepository(ContactSetting)
    private readonly contactSettingRepository: Repository<ContactSetting>,
  ) {}

  private getCurrentTime() {
    return new Date().toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
    });
  }

  private async getOrCreateContactSettings() {
    const setting = await this.contactSettingRepository.findOne({
      where: {},
      order: { id: "ASC" },
    });

    if (setting) return setting;

    return this.contactSettingRepository.save(
      this.contactSettingRepository.create({
        hotline: "1900 0980",
        zalo: "#zalo",
        messenger: "#messenger",
        email: "cayphuongk18@gmail.com",
        updated_by: null,
      }),
    );
  }

  async getContactSettings() {
    const setting = await this.getOrCreateContactSettings();

    this.contactLogger.log(
      `Get contact setting successfully at ${this.getCurrentTime()}`,
    );

    return setting;
  }

  async updateContactSettings(
    updateContactSettingsDto: UpdateContactSettingsDTO,
  ) {
    const setting = await this.getOrCreateContactSettings();

    if (updateContactSettingsDto.hotline !== undefined) {
      setting.hotline = updateContactSettingsDto.hotline;
    }

    if (updateContactSettingsDto.zalo !== undefined) {
      setting.zalo = updateContactSettingsDto.zalo;
    }

    if (updateContactSettingsDto.messenger !== undefined) {
      setting.messenger = updateContactSettingsDto.messenger;
    }

    if (updateContactSettingsDto.email !== undefined) {
      setting.email = updateContactSettingsDto.email;
    }

    this.contactLogger.log(
      `Update contact settings successfully at ${this.getCurrentTime()}`,
    );

    return this.contactSettingRepository.save(setting);
  }
}
