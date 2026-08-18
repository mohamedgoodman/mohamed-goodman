# Photo library

One folder per category. The bot discovers them at run time — create a folder,
drop `.jpg` / `.jpeg` / `.png` / `.webp` files in it, and it is immediately
available to `/media`, `/send` and `/browse`. No restart, no config entry.

```
media/
  boudoir/      → /send boudoir
  fullbody/     → /send fullbody
  closeups/     → /send closeups
```

Name the folders whatever you actually use — the names are yours, and nothing
in the code depends on them. Folder names are what you'll type, so short and
lowercase is easiest.

Files here are ignored by git (see `.gitignore`) so your photos never end up in
the repository.
