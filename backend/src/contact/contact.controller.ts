import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ContactService } from './contact.service';
import { UpdateContactSettingsDTO } from './dto/contact.dto';

@Controller('contact')
export class ContactController {
    constructor(private readonly contactService: ContactService) {}

    // METHOD: GET '/'
    @Get()
    getContact() {
        return this.contactService.getContactSettings()
    }

    // METHOD: PATCH
    @Patch()
    updateContact(@Body() contactSettingDTO: UpdateContactSettingsDTO) {
        return this.contactService.updateContactSettings(contactSettingDTO)
    }
}
