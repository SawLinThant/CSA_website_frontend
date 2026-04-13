"use client";

import Image from "next/image";
import { startTransition, useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Home, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { type Locale, withLocalePath } from "@/i18n/config";
import {
  deleteCustomerAddressAction,
  saveCustomerAddressAction,
  setDefaultCustomerAddressAction,
  updateCustomerProfileAction,
  type FormActionState,
} from "../actions/profileActions";
import type { CustomerAddress, CustomerProfileResponse } from "../domain/schemas";

const initialState: FormActionState = { ok: false };
const MAX_PROFILE_IMAGE_UPLOAD_BYTES = 4 * 1024 * 1024; // 4MB safety check before Server Action submit.

function AddressCard({
  address,
  locale,
  onEdit,
}: {
  address: CustomerAddress;
  locale: Locale;
  onEdit: (address: CustomerAddress) => void;
}) {
  const [deleteState, deleteAction, deletePending] = useActionState(deleteCustomerAddressAction, initialState);
  const [defaultState, defaultAction, defaultPending] = useActionState(setDefaultCustomerAddressAction, initialState);

  useEffect(() => {
    if (deleteState === initialState) return;
    if (deleteState.ok) toast.success("Address removed.");
    else if (deleteState.error) toast.error(deleteState.error);
  }, [deleteState]);

  useEffect(() => {
    if (defaultState === initialState) return;
    if (defaultState.ok) toast.success("Default address updated.");
    else if (defaultState.error) toast.error(defaultState.error);
  }, [defaultState]);

  return (
    <article className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3">
          <span className="mt-1 inline-flex size-7 items-center justify-center rounded-full bg-[#eef7ea] text-[#4cab2e]">
            <Home className="size-4" aria-hidden />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{address.addressLine}</h3>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{address.state}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onEdit(address);
            }}
            disabled={deletePending || defaultPending}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted disabled:opacity-50"
            aria-label="Edit address"
          >
            <Pencil className="size-4" />
          </button>
          <form action={deleteAction}>
            <input type="hidden" name="_locale" value={locale} />
            <input type="hidden" name="id" value={address.id} />
            <button
              type="submit"
              disabled={deletePending}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted disabled:opacity-50"
              aria-label="Delete address"
            >
              <Trash2 className="size-4" />
            </button>
          </form>
        </div>
      </div>
      <p className="mt-3 text-sm leading-5 text-muted-foreground">
        {address.city}, {address.state}
        <br />
        {address.postalCode}
        <br />
        {address.country}
      </p>
      <div className="mt-3">
        {address.isDefault ? (
          <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium text-foreground">
            <CheckCircle2 className="size-3.5 text-[#4cab2e]" />
            Default Address
          </span>
        ) : (
          <form action={defaultAction}>
            <input type="hidden" name="_locale" value={locale} />
            <input type="hidden" name="id" value={address.id} />
            <button type="submit" disabled={defaultPending} className="text-xs font-medium text-primary hover:underline disabled:opacity-50">
              {defaultPending ? "Updating..." : "Set as default"}
            </button>
          </form>
        )}
      </div>
    </article>
  );
}

export default function CustomerProfilePageClient({
  locale,
  profile,
  addresses,
}: {
  locale: Locale;
  profile: CustomerProfileResponse;
  addresses: CustomerAddress[];
}) {
  const router = useRouter();
  const [profileState, profileAction, profilePending] = useActionState(updateCustomerProfileAction, initialState);
  const [addressState, addressAction, addressPending] = useActionState(saveCustomerAddressAction, initialState);
  const [editing, setEditing] = useState<CustomerAddress | null>(null);

  useEffect(() => {
    if (profileState === initialState) return;
    if (profileState.ok) toast.success("Profile saved.");
    else if (profileState.error) toast.error(profileState.error);
  }, [profileState]);

  useEffect(() => {
    if (addressState === initialState) return;
    if (addressState.ok) {
      toast.success(editing ? "Address updated." : "Address saved.");
      setEditing(null);
    } else if (addressState.error) {
      toast.error(addressState.error);
    }
  }, [addressState, editing]);

  const activeCount = useMemo(() => addresses.length, [addresses.length]);
  const user = profile.user;
  const joined = `Member since ${new Date(user.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
  })}`;

  function onProfileSubmit(event: React.FormEvent<HTMLFormElement>) {
    const fd = new FormData(event.currentTarget);
    const file = fd.get("image");
    if (!(file instanceof File) || file.size <= 0) return;
    if (file.size > MAX_PROFILE_IMAGE_UPLOAD_BYTES) {
      event.preventDefault();
      const maxMb = Math.floor(MAX_PROFILE_IMAGE_UPLOAD_BYTES / (1024 * 1024));
      toast.error(`Image is too large. Please upload a file up to ${maxMb}MB.`);
    }
  }

  function onAddressSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => {
      addressAction(formData);
    });
  }

  async function onLogout() {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (!res.ok) {
        toast.error("Failed to logout. Please try again.");
        return;
      }
      toast.success("Logged out successfully.");
      router.replace(withLocalePath(locale, "/customer/login"));
      router.refresh();
    } catch {
      toast.error("Failed to logout. Please try again.");
    }
  }

  return (
    <div className="py-8">
      <h1 className="text-3xl font-semibold text-foreground">Profile</h1>
      <p className="mt-1 text-sm text-muted-foreground">Update your personal information and delivery logistics.</p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="space-y-4 lg:col-span-4">
          <form onSubmit={onProfileSubmit} action={profileAction} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <input type="hidden" name="_locale" value={locale} />
            <div className="h-18 bg-[#dfeadf]" />
            <div className="px-5 pb-5">
              <div className="-mt-10 flex justify-center">
                <div className="relative size-20 overflow-hidden rounded-full border-4 border-white bg-muted">
                  <Image
                    src={user.imageUrl || "/images/farmers/avatar-placeholder.svg"}
                    alt={user.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
              </div>

              <div className="mt-3 text-center">
                <h2 className="text-xl font-semibold text-foreground">{user.name}</h2>
                <p className="text-sm text-muted-foreground">{joined}</p>
              </div>

              <div className="mt-5 space-y-3">
                <label className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Full Name</span>
                  <input
                    name="name"
                    defaultValue={user.name}
                    required
                    className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none ring-ring/40 focus:ring-2"
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Email Address</span>
                  <input
                    name="email"
                    type="email"
                    defaultValue={user.email ?? ""}
                    className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none ring-ring/40 focus:ring-2"
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Phone Number</span>
                  <input
                    name="phone"
                    defaultValue={user.phone}
                    required
                    minLength={6}
                    className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none ring-ring/40 focus:ring-2"
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Image URL (optional)</span>
                  <input
                    name="imageUrl"
                    type="url"
                    defaultValue={user.imageUrl ?? ""}
                    placeholder="https://"
                    className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none ring-ring/40 focus:ring-2"
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Profile Image File</span>
                  <input
                    name="image"
                    type="file"
                    accept="image/*"
                    className="mt-1 w-full text-sm file:mr-2 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-primary-foreground"
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={profilePending}
                className="mt-5 w-full rounded-xl bg-[#54b531] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#4aa12c] disabled:opacity-70"
              >
                {profilePending ? "Saving..." : "Save Profile Changes"}
              </button>
              <button
                type="button"
                onClick={() => void onLogout()}
                className="mt-3 w-full rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100"
              >
                Logout
              </button>
            </div>
          </form>
        </section>

        <section className="space-y-4 lg:col-span-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Saved Addresses</h2>
            <p className="text-sm font-medium text-muted-foreground">{activeCount} Active</p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {addresses.map((address) => (
              <AddressCard key={address.id} address={address} locale={locale} onEdit={setEditing} />
            ))}
          </div>

          <form
            key={editing?.id ?? "new"}
            onSubmit={onAddressSubmit}
            className="rounded-2xl border border-border bg-card p-5 shadow-sm"
          >
            <input type="hidden" name="_locale" value={locale} />
            <input type="hidden" name="id" value={editing?.id ?? ""} />
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-foreground">{editing ? "Edit Location" : "Add New Location"}</h3>
                <p className="text-sm text-muted-foreground">Register a new delivery point or collection site.</p>
              </div>
              {editing ? (
                <button type="button" disabled={addressPending} onClick={() => setEditing(null)} className="text-sm font-medium text-primary hover:underline disabled:opacity-50">
                  Cancel edit
                </button>
              ) : null}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Address Label</span>
                <input
                  name="addressLine"
                  defaultValue={editing?.addressLine ?? ""}
                  placeholder="e.g. North Warehouse"
                  required
                  className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none ring-ring/40 focus:ring-2"
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">City</span>
                <input
                  name="city"
                  defaultValue={editing?.city ?? ""}
                  placeholder="City"
                  required
                  className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none ring-ring/40 focus:ring-2"
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Postal Code</span>
                <input
                  name="postalCode"
                  defaultValue={editing?.postalCode ?? ""}
                  placeholder="ZIP code"
                  required
                  className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none ring-ring/40 focus:ring-2"
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">State</span>
                <input
                  name="state"
                  defaultValue={editing?.state ?? ""}
                  placeholder="State / Region"
                  required
                  className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none ring-ring/40 focus:ring-2"
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Country</span>
                <input
                  name="country"
                  defaultValue={editing?.country ?? "United States"}
                  required
                  className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none ring-ring/40 focus:ring-2"
                />
              </label>
              <label className="mt-1 inline-flex items-center gap-2 text-sm text-muted-foreground md:col-span-2">
                <input
                  type="checkbox"
                  name="isDefault"
                  value="true"
                  defaultChecked={editing?.isDefault ?? addresses.length === 0}
                  className="size-4 rounded border-input"
                />
                Set as default address
              </label>
            </div>

            <button
              type="submit"
              disabled={addressPending}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted disabled:opacity-70"
            >
              <Plus className="size-4" />
              {addressPending ? "Saving..." : editing ? "Update This Address" : "Add This Address"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
