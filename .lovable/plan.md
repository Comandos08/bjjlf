# Wire ImageUploader into Black Belts admin

## Status of the requested forms

I checked all four files. Three of them already use `ImageUploader`:

- `src/routes/admin.hero.tsx` (line 159) — folder `hero`, writes `image_url`. ✅ already done
- `src/routes/admin.news.tsx` (line 282) — folder `news`, writes `cover_image_url`. ✅ already done
- `src/routes/admin.events.tsx` (line 362) — folder `events`, writes `image_url`. ✅ already done
- `src/routes/admin.black-belts.tsx` — still uses a plain `<input>` for `photo_url` (lines 248–252). ❌ needs the change

The `ImageUploader` component itself already satisfies all the implementation rules listed in the request: it has the manual URL fallback input, an upload button + loading state, a built-in preview, square corners, and posts to the `site-images` bucket.

## Change

In `src/routes/admin.black-belts.tsx`:

1. Add `import { ImageUploader } from "@/components/admin/ImageUploader";`.
2. Replace the photo block (lines 248–252) — the plain `<label>URL da foto</label> + <input> + <img>` — with:

   ```tsx
   <ImageUploader
     label="Foto"
     folder="black-belts"
     value={photo}
     onChange={(url) => setValue("photo_url", url, { shouldValidate: true })}
     previewClassName="mt-2 h-24 w-24 rounded-full object-cover border"
   />
   ```

3. Keep `const photo = watch("photo_url");` (still used to feed `value`).
4. No schema, no DB and no other component changes.

The uploader pushes files to `site-images/black-belts/...` and stores the resulting public URL in the existing `photo_url` field, so the rest of the form, the table thumbnail, and the public Black Belts page keep working unchanged.

## Files touched

- `src/routes/admin.black-belts.tsx` (1 import + 1 JSX block replacement)
