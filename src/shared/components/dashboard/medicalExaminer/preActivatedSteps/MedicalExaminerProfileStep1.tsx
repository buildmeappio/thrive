'use client';
import React, { useRef, useState } from 'react';
import { User, Phone, Mail, MapPin } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Dropdown } from '@/shared/components/ui/Dropdown';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/shared/components/ui/avatar';
import { provinceOptions } from '@/shared/config/dropdownOptions/MedExaminerDropdownOptions';

const MedicalExaminerProfileStep1 = () => {
  const [values, setValues] = React.useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    emailAddress: "",
    provinceOfResidence: "",
    mailingAddress: "",
    bio: ""
  });

  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const errors: Record<string, string> = {};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const setFieldValue = (field: string, value: string) => {
    setValues(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 mt-4">
      {/* Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="firstName" className="text-sm text-black">
            First Name<span className="text-red-500">*</span>
          </Label>
          <Input
            name="firstName"
            id="firstName"
            icon={User}
            placeholder="Dr. Sarah"
            value={values.firstName}
            onChange={handleChange}
          />
          {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
        </div>
        <div>
          <Label htmlFor="lastName" className="text-sm text-black">
            Last Name<span className="text-red-500">*</span>
          </Label>
          <Input
            name="lastName"
            id="lastName"
            icon={User}
            placeholder="Ahmed"
            value={values.lastName}
            onChange={handleChange}
          />
          {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
        </div>
        <div>
          <Label htmlFor="phoneNumber" className="text-sm text-black">
            Phone Number<span className="text-red-500">*</span>
          </Label>
          <Input
            name="phoneNumber"
            id="phoneNumber"
            icon={Phone}
            placeholder="(647) 555-1923"
            value={values.phoneNumber}
            onChange={handleChange}
          />
          {errors.phoneNumber && <p className="text-xs text-red-500">{errors.phoneNumber}</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="emailAddress" className="text-sm text-black">
            Email Address<span className="text-red-500">*</span>
          </Label>
          <Input
            name="emailAddress"
            id="emailAddress"
            type="email"
            icon={Mail}
            placeholder="s.ahmed@precisionmed.ca"
            value={values.emailAddress}
            onChange={handleChange}
          />
          {errors.emailAddress && <p className="text-xs text-red-500">{errors.emailAddress}</p>}
        </div>

        <div>
          <Dropdown
            id="provinceOfResidence"
            label="Province of Residence"
            value={values.provinceOfResidence}
            onChange={value => setFieldValue('provinceOfResidence', value)}
            options={provinceOptions}
            required={true}
            placeholder="Select Province"
          />
          {errors.provinceOfResidence && <p className="text-xs text-red-500">{errors.provinceOfResidence}</p>}
        </div>

        <div>
          <Label htmlFor="mailingAddress" className="text-sm text-black">
            Mailing Address<span className="text-red-500">*</span>
          </Label>
          <Input
            name="mailingAddress"
            id="mailingAddress"
            icon={MapPin}
            placeholder="125 Bay Street, Suite 600"
            value={values.mailingAddress}
            onChange={handleChange}
          />
          {errors.mailingAddress && <p className="text-xs text-red-500">{errors.mailingAddress}</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3 flex flex-col items-center lg:items-start">
          <Label className="text-sm text-black mb-2 block">
            Profile Photo<span className="text-red-500">*</span>
          </Label>
          <div
            className="mt-2 flex cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Avatar className="w-28 h-28 sm:w-32 sm:h-32 border-2 border-gray-200">
              <AvatarImage src={profilePhoto || "/images/avatar.png"} />
              <AvatarFallback className="bg-[#37BBFF] text-white text-lg">
                SA
              </AvatarFallback>
            </Avatar>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        </div>

        <div className="lg:col-span-9 flex flex-col">
          <Label htmlFor="bio" className="text-sm text-black mb-2">
            Add Bio<span className="text-red-500">*</span>
          </Label>
          <div className="relative space-y-3">
            <Textarea
              name="bio"
              id="bio"
              placeholder="Tell us about yourself and your background"
              value={values.bio}
              onChange={handleChange}
              className="min-h-[130px] w-full resize-none text-sm sm:text-base md:min-h-[140px]"
              maxLength={500}
            />
            <div className="absolute right-2 bottom-6 text-xs text-gray-400 md:right-3 md:bottom-3 md:text-sm">
              {values.bio.length}/500
            </div>
          </div>
          {errors.bio && <p className="text-xs text-red-500">{errors.bio}</p>}
        </div>
      </div>
    </div>
  );
};

export default MedicalExaminerProfileStep1;
