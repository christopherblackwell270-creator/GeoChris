# Editing and publishing your website

Your site is a set of plain files, so there's nothing to install and no
website builder to log in to. You can change anything with a text editor,
and GitHub Pages hosts it for free.

## What's in the folder

| File or folder | What it is |
|---|---|
| `index.html` | All the words on the site: every section, project, job and conference. This is the file you'll edit most. |
| `style.css` | Colors, fonts and layout. You rarely need to touch it. |
| `main.js` | The moving parts: the contour map at the top, the dropdown menus and the email Copy button. Leave it alone. |
| `images/` | Every photo and map picture on the site. Class map pictures are in `images/class/`. |
| `docs/` | The PDFs the site links to: your paper, poster, report and full-size maps. Class map PDFs are in `docs/class/`. |
| `resume.pdf` | Your resume. Both Resume buttons open this file. |

**Tip:** Edit in [Visual Studio Code](https://code.visualstudio.com/)
(free). It colors the code so it's easier to read. To preview your changes,
double-click `index.html` and it opens in your browser. Refresh the browser
after each save.

## Finding a section in index.html

Each section starts with a line like `<section class="layer" id="research">`.
Search the file (Ctrl+F or Cmd+F) for the id:

| On the site | Search for |
|---|---|
| Top title and tagline | `class="hero"` |
| About (bio, degree, GPA, headshot) | `id="about"` |
| Research | `id="research"` |
| Capstone | `id="capstone"` |
| Selected geospatial projects | `id="projects"` |
| Class maps | `id="classmaps"` |
| Passion projects | `id="passion"` |
| Work experience | `id="fieldwork"` |
| Skills | `id="skills"` |
| Resume | `id="resume"` |
| Content (YouTube channel) | `id="content"` |
| Upcoming conferences | `id="conferences"` |
| Off the map | `id="offmap"` |
| Contact | `id="contact"` |
| Dropdown menus | `class="dd-menu"` |

## Common edits

### Change some text
Find the words in `index.html` and type over them. Only change the words
between the tags. Leave anything inside `< >` alone.

```html
<p>I'm looking for opportunities in GIS ...</p>
     ^ change only this part ^
```

### Replace a photo
1. Put the new image in `images/`. Use a short name with no spaces, like `goby-2027.jpg`.
2. In `index.html`, find the old file name, for example `images/headshot.jpg`, and change it to the new one.
3. Update the `alt="..."` text next to it. It describes the picture for screen readers.

Keep photos under about 1 MB. Anything wider than 1600 pixels is more than the site needs.

### Add a project (research, GIS, class map or passion)
Each project is a block that starts with `<article class="project">` and
ends with `</article>`.
1. Copy a whole block, from `<article` to `</article>`.
2. Paste it right after the last project in the same section.
3. Change the image, the line with `class="meta"` (type and date), the title in `<h3>`, the description, the tags in `<li>` and the PDF link.
4. Put the map image in `images/` and the PDF in `docs/`.

In Class maps, only the first three cards show until a visitor clicks **Show all**, so put your favorite maps at the top of that list.

### Add or update a conference
In the `id="conferences"` section, each event is one `<li>` block. Copy one
and change the date, name, link, location and description. Delete events
once they've passed.

### Add a job
In the `id="fieldwork"` section, copy one `<li>` block in the
`class="timeline"` list. Change the dates, title, organization and bullet
points.

### Replace your resume
Save the new one as `resume.pdf`, with exactly that name, and replace the old file.

## Publishing on GitHub Pages

### First time
1. Make a free account at [github.com](https://github.com). Your site address will be `https://YOUR-USERNAME.github.io`.
2. Click **+** at the top right, then **New repository**.
3. Name it exactly `YOUR-USERNAME.github.io`, set it to **Public**, and click **Create repository**.
4. Click **uploading an existing file**. Drag in everything from this folder: `index.html`, `style.css`, `main.js`, `resume.pdf`, and the `images` and `docs` folders. Then click **Commit changes**.
5. Go to **Settings**, then **Pages**. Under "Branch," pick **main** and **/ (root)**, then click **Save**.
6. Wait a minute or two, then visit `https://YOUR-USERNAME.github.io`.

### Making changes later
**Small text edit:** Open `index.html` on github.com, click the pencil
icon, make the change and click **Commit changes**. The live site updates
within a minute or two.

**New photos or files:** In the repository, click **Add file**, then
**Upload files**. Drag them in (into `images/` or `docs/`), then click
**Commit changes**.

**Lots of changes:** Install [GitHub Desktop](https://desktop.github.com/)
and clone the repository to your computer. Edit the files there and preview
them by double-clicking `index.html`. Then click **Commit** and **Push** to
publish.

If the live site doesn't show your change, hard-refresh the page
(Ctrl+Shift+R, or Cmd+Shift+R on a Mac). Browsers sometimes keep the old
version for a moment.

## Before you go public
- `resume.pdf` includes your phone number. Anyone who visits the site can download it. If you'd rather not share your number, upload a version without it.
- Everything in the repository is public, so don't put your transcript or anything private in it.
