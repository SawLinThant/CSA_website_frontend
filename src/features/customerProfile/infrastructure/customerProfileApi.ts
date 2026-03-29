import {
  backendDeleteNoContent,
  backendGetJson,
  backendPatchJson,
  backendPostJson,
} from "@/lib/server/backendClient";
import {
  customerAddressListResponseSchema,
  customerAddressSchema,
  customerProfileResponseSchema,
  type CustomerAddress,
  type CustomerProfileResponse,
  type SaveCustomerAddressBody,
  type UpdateCustomerProfileBody,
} from "../domain/schemas";

export async function getCustomerProfile(): Promise<CustomerProfileResponse> {
  const data = await backendGetJson<unknown>("/auth/customer/profile", undefined, { requiresAuth: true });
  return customerProfileResponseSchema.parse(data);
}

export async function listCustomerAddresses(): Promise<CustomerAddress[]> {
  const data = await backendGetJson<unknown>("/auth/customer/addresses", undefined, { requiresAuth: true });
  return customerAddressListResponseSchema.parse(data).items;
}

export async function patchCustomerProfile(body: UpdateCustomerProfileBody): Promise<CustomerProfileResponse> {
  const data = await backendPatchJson<UpdateCustomerProfileBody, unknown>("/auth/customer/profile", body, {
    requiresAuth: true,
  });
  return customerProfileResponseSchema.parse(data);
}

export async function createCustomerAddress(body: SaveCustomerAddressBody): Promise<CustomerAddress> {
  const data = await backendPostJson<SaveCustomerAddressBody, unknown>("/auth/customer/addresses", body, {
    requiresAuth: true,
  });
  return customerAddressSchema.parse(data);
}

export async function updateCustomerAddress(addressId: string, body: Partial<SaveCustomerAddressBody>): Promise<CustomerAddress> {
  const data = await backendPatchJson<Partial<SaveCustomerAddressBody>, unknown>(
    `/auth/customer/addresses/${addressId}`,
    body,
    { requiresAuth: true },
  );
  return customerAddressSchema.parse(data);
}

export async function deleteCustomerAddress(addressId: string): Promise<void> {
  await backendDeleteNoContent(`/auth/customer/addresses/${addressId}`, { requiresAuth: true });
}
