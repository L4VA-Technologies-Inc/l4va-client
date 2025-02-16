import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Facebook, Twitter, Upload } from 'lucide-react';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const SUPPORTED_FORMATS = ['image/jpg', 'image/jpeg', 'image/png', 'image/webp'];

const validationSchema = Yup.object().shape({
  vaultName: Yup.string().required('Vault name is required'),
  vaultType: Yup.string().required('Vault type is required'),
  vaultPrivacy: Yup.string().required('Vault privacy is required'),
  vaultBrief: Yup.string(),
  vaultImage: Yup.mixed()
    .test('fileSize', 'File too large', (value) => {
      if (!value) return true;
      return value.size <= MAX_FILE_SIZE;
    })
    .test('fileFormat', 'Unsupported format', (value) => {
      if (!value) return true;
      return SUPPORTED_FORMATS.includes(value.type);
    }),
  vaultBanner: Yup.mixed()
    .test('fileSize', 'File too large', (value) => {
      if (!value) return true;
      return value.size <= MAX_FILE_SIZE;
    })
    .test('fileFormat', 'Unsupported format', (value) => {
      if (!value) return true;
      return SUPPORTED_FORMATS.includes(value.type);
    }),
  socialLinks: Yup.object().shape({
    facebook: Yup.string().url('Must be a valid URL'),
    twitter: Yup.string().url('Must be a valid URL'),
  }),
});

export const FirstStep = () => {
  const [imagePreview, setImagePreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const imageInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const formik = useFormik({
    initialValues: {
      vaultName: '',
      vaultType: 'multi',
      vaultPrivacy: 'public',
      vaultBrief: '',
      vaultImage: null,
      vaultBanner: null,
      socialLinks: {
        facebook: '',
        twitter: '',
      },
    },
    validationSchema,
    onSubmit: (values) => {
      console.log(values);
    },
  });

  const handleFileChange = (event, field, setPreview) => {
    const file = event.currentTarget.files[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        formik.setFieldError(field, 'File size must be less than 5MB');
        return;
      }
      if (!SUPPORTED_FORMATS.includes(file.type)) {
        formik.setFieldError(field, 'Unsupported file format');
        return;
      }

      formik.setFieldValue(field, file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="mx-auto space-y-8 bg-[#0a0b1e] text-white">
      <form className="space-y-8" onSubmit={formik.handleSubmit}>
        <div className="space-y-2">
          <Label className="text-lg font-semibold" htmlFor="vaultName">
            VAULT NAME
          </Label>
          <Input
            className="bg-[#0a0b1e] border-[#2a2b3d] h-12"
            id="vaultName"
            name="vaultName"
            placeholder="Enter the name of your Vault"
            value={formik.values.vaultName}
            onChange={formik.handleChange}
          />
          {formik.errors.vaultName && (
            <div className="text-red-500">{formik.errors.vaultName}</div>
          )}
        </div>
        <div className="space-y-2">
          <Label className="text-lg font-semibold">VAULT TYPE</Label>
          <RadioGroup
            className="space-y-2"
            defaultValue={formik.values.vaultType}
            onValueChange={(value) => formik.setFieldValue('vaultType', value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="single" value="single" />
              <Label htmlFor="single">Single NFT</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="multi" value="multi" />
              <Label htmlFor="multi">Multi NFT</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="cnt" value="cnt" />
              <Label htmlFor="cnt">Any CNT</Label>
            </div>
          </RadioGroup>
        </div>
        <div className="space-y-2">
          <Label className="text-lg font-semibold">VAULT PRIVACY</Label>
          <RadioGroup
            className="space-y-2"
            defaultValue={formik.values.vaultPrivacy}
            onValueChange={(value) => formik.setFieldValue('vaultPrivacy', value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="private" value="private" />
              <Label htmlFor="private">Private Vault</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="public" value="public" />
              <Label htmlFor="public">Public Vault</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="semi-private" value="semi-private" />
              <Label htmlFor="semi-private">Semi-Private Vault</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Vault Brief */}
        <div className="space-y-2">
          <Label className="text-lg font-semibold" htmlFor="vaultBrief">
            VAULT BRIEF <span className="text-gray-400">(OPTIONAL)</span>
          </Label>
          <Textarea
            className="bg-[#0a0b1e] border-[#2a2b3d] min-h-32"
            id="vaultBrief"
            name="vaultBrief"
            placeholder="Add a description for your Vault"
            value={formik.values.vaultBrief}
            onChange={formik.handleChange}
          />
        </div>
        <Card className="bg-[#1c1d2e] border-[#2a2b3d]">
          <CardContent className="p-4">
            <div
              className="h-48 relative flex items-center justify-center border-2 border-dashed border-[#2a2b3d] rounded-lg overflow-hidden"
              onClick={() => imageInputRef.current?.click()}
            >
              {imagePreview ? (
                <img
                  alt="Vault preview"
                  className="w-full h-full object-cover"
                  src={imagePreview}
                />
              ) : (
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 bg-[#2a2b3d] rounded-lg flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p>Upload Image</p>
                  <p className="text-sm text-gray-400 mt-2">
                    JPG, PNG, WebP | Max 5MB
                  </p>
                </div>
              )}
              <input
                ref={imageInputRef}
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                name="vaultImage"
                type="file"
                onChange={(e) => handleFileChange(e, 'vaultImage', setImagePreview)}
              />
            </div>
            {formik.errors.vaultImage && (
              <div className="text-red-500 mt-2">{formik.errors.vaultImage}</div>
            )}
          </CardContent>
        </Card>
        <Card className="bg-[#1c1d2e] border-[#2a2b3d]">
          <CardContent className="p-4">
            <div
              className="h-48 relative flex items-center justify-center border-2 border-dashed border-[#2a2b3d] rounded-lg overflow-hidden"
              onClick={() => bannerInputRef.current?.click()}
            >
              {bannerPreview ? (
                <img
                  alt="Banner preview"
                  className="w-full h-full object-cover"
                  src={bannerPreview}
                />
              ) : (
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 bg-[#2a2b3d] rounded-lg flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p>Upload Banner</p>
                  <p className="text-sm text-gray-400 mt-2">
                    JPG, PNG, WebP | Max 5MB
                  </p>
                </div>
              )}
              <input
                ref={bannerInputRef}
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                name="vaultBanner"
                type="file"
                onChange={(e) => handleFileChange(e, 'vaultBanner', setBannerPreview)}
              />
            </div>
            {formik.errors.vaultBanner && (
              <div className="text-red-500 mt-2">{formik.errors.vaultBanner}</div>
            )}
          </CardContent>
        </Card>
        <div className="space-y-4">
          <Label className="text-lg font-semibold">SOCIAL LINKS</Label>

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-[#1c1d2e] rounded-lg flex items-center justify-center">
                <Facebook className="w-6 h-6" />
              </div>
              <Input
                className="flex-1 bg-[#0a0b1e] border-[#2a2b3d] h-12"
                name="socialLinks.facebook"
                placeholder="facebook.com/l4vaProject"
                value={formik.values.socialLinks.facebook}
                onChange={formik.handleChange}
              />
              <Button
                className="w-12 h-12 bg-[#1c1d2e] rounded-lg"
                type="button"
                variant="ghost"
              >
                −
              </Button>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-[#1c1d2e] rounded-lg flex items-center justify-center">
                <Twitter className="w-6 h-6" />
              </div>
              <Input
                className="flex-1 bg-[#0a0b1e] border-[#2a2b3d] h-12"
                name="socialLinks.twitter"
                placeholder="x.com/l4vaProject"
                value={formik.values.socialLinks.twitter}
                onChange={formik.handleChange}
              />
              <Button
                className="w-12 h-12 bg-[#1c1d2e] rounded-lg"
                type="button"
                variant="ghost"
              >
                +
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
