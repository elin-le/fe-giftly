import { Plus } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { AddressForm } from '@/features/addresses/components/AddressForm'
import { formatAddress } from '@/features/addresses/formatAddress'
import type { Address } from '@/features/addresses/types'
import { cn } from '@/lib/cn'

interface AddressPickerProps {
  addresses: Address[]
  selectedId: string | null
  onSelect: (id: string) => void
  onCreated: (address: Address) => void
}

export function AddressPicker({ addresses, selectedId, onSelect, onCreated }: AddressPickerProps) {
  const [isAdding, setIsAdding] = useState(addresses.length === 0)

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-1 text-sm font-semibold">Địa chỉ nhận hàng</legend>
      {addresses.map((address) => (
        <label
          key={address.id}
          className={cn(
            'flex cursor-pointer items-start gap-3 rounded-2xl border p-4 text-sm',
            address.id === selectedId ? 'border-accent bg-accent-soft' : 'border-border bg-surface',
          )}
        >
          <input
            type="radio"
            name="addressId"
            className="mt-1 accent-primary"
            checked={address.id === selectedId}
            onChange={() => onSelect(address.id)}
          />
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="font-semibold">
              {address.recipientName} · {address.phone}
              {address.isDefault && <span className="ml-2 text-xs font-normal text-muted-foreground">Mặc định</span>}
            </span>
            <span className="text-muted-foreground">{formatAddress(address)}</span>
          </span>
        </label>
      ))}

      {isAdding ? (
        <AddressForm
          isFirstAddress={addresses.length === 0}
          onCancel={addresses.length > 0 ? () => setIsAdding(false) : undefined}
          onCreated={(address) => {
            setIsAdding(false)
            onCreated(address)
          }}
        />
      ) : (
        <Button type="button" variant="outline" className="self-start" onClick={() => setIsAdding(true)}>
          <Plus /> Thêm địa chỉ mới
        </Button>
      )}
    </fieldset>
  )
}
