$content = Get-Content "d:\projects\portfolio\index.html" -Raw

# Replace old links with new links
$content = $content -replace '<li><a href="#about">About</a></li>', '<li><a href="index.html#about">About</a></li>'
$content = $content -replace '<li><a href="#skills">Skills</a></li>', '<li><a href="skills.html">Skills</a></li>'
$content = $content -replace '<li><a href="#experience">Experience</a></li>', '<li><a href="experience.html">Experience</a></li>'
$content = $content -replace '<li><a href="#projects">Projects</a></li>', '<li><a href="projects.html">Projects</a></li>'
$content = $content -replace '<li><a href="#certifications">Certifications</a></li>', '<li><a href="certifications.html">Certifications</a></li>'
$content = $content -replace '<li><a href="#contact">Contact</a></li>', '<li><a href="contact.html">Contact</a></li>'

# Remove old script tag from bottom
$content = $content -replace '(?s)<script>.*?</script>\s*</body>', '<script src="script.js"></script></body>'

# Extract head and header
$headRegex = '(?s)(<!DOCTYPE html>.*?<main id="top">)'
$headMatch = [regex]::Match($content, $headRegex)
$head = $headMatch.Groups[1].Value

# Extract footer
$footerRegex = '(?s)(</main>\s*<footer>.*)'
$footerMatch = [regex]::Match($content, $footerRegex)
$footer = $footerMatch.Groups[1].Value

# Extract sections
function Get-Section($id) {
    # Match the section exactly, but careful with hero which is a class
    if ($id -eq "hero") {
        $regex = '(?s)(<!-- HERO -->\s*<section class="hero">.*?</section>)'
    } elseif ($id -eq "activities") {
        $regex = '(?s)(<!-- HACKATHONS -->\s*<section id="activities">.*?</section>)'
    } else {
        $regex = "(?s)(<!-- $($id.ToUpper()) -->\s*<section id=""$id"">.*?</section>)"
    }
    $match = [regex]::Match($content, $regex)
    return $match.Groups[1].Value
}

$heroSection = Get-Section "hero"
# Add comment for resume in hero
$heroSection = $heroSection -replace '<a href="resume.pdf"', '<!-- TODO: Drop your actual resume.pdf in the root directory --><a href="resume.pdf"'

$aboutSection = Get-Section "about"
$skillsSection = Get-Section "skills"
$experienceSection = Get-Section "experience"
$activitiesSection = Get-Section "activities"
$projectsSection = Get-Section "projects"
$certificationsSection = Get-Section "certifications"
$contactSection = Get-Section "contact"

# Modify certifications to include lightbox attributes
$certificationsSection = $certificationsSection -replace '<h4>Cloud Infrastructure &amp; Services</h4>', '<h4>Cloud Infrastructure &amp; Services</h4>'
# We will use regex to find all cert-card and inject data-cert-image attribute
$certIndex = 1
$certNames = @("Redback.jpeg", "claude.jpeg", "codinaction.jpeg", "mongo.jpeg", "google.jpeg", "VIT.jpeg", "NPTEL.jpeg", "elevanceskill.jpeg")
$lines = $certificationsSection -split "`n"
$newLines = @()
$certIdx = 0
foreach ($line in $lines) {
    if ($line -match '<div class="cert-card">') {
        if ($certIdx -lt $certNames.Length) {
            $imageName = $certNames[$certIdx]
            $line = $line -replace '<div class="cert-card">', "<div class=""cert-card"" data-cert-image=""certificates/$imageName"">"
            $certIdx++
        }
    }
    $newLines += $line
}
$certificationsSection = $newLines -join "`n"

# Add Modal HTML to certifications section
$modalHtml = @"

  <!-- Certificate Lightbox/Modal -->
  <div class="modal-overlay" id="certModal">
    <div class="modal-content">
      <button class="modal-close" id="certModalClose" aria-label="Close modal">&times;</button>
      <img src="" alt="Certificate" id="certModalImg">
    </div>
  </div>
"@
$certificationsSection += $modalHtml


# Modify contact form for EmailJS
$emailjsScript = '<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>
<script type="text/javascript">
  // REPLACE_WITH_YOUR_EMAILJS_PUBLIC_KEY
  (function() {
      // emailjs.init({ publicKey: "YOUR_PUBLIC_KEY" });
  })();
</script>'

# We need to insert emailjs SDK into the head for contact.html ONLY, or we can just put it at the end of body.
$contactFooter = $footer -replace '<script src="script.js"></script></body>', "$emailjsScript`n<script src=""script.js""></script></body>"

# Also add the form-message div to contact form
$contactSection = $contactSection -replace '</form>', '<div id="formMessage" class="form-message"></div></form>'


# Write pages
Set-Content "d:\projects\portfolio\index.html" ($head + "`n" + $heroSection + "`n" + $aboutSection + "`n" + $footer)
Set-Content "d:\projects\portfolio\skills.html" ($head + "`n" + $skillsSection + "`n" + $footer)
Set-Content "d:\projects\portfolio\experience.html" ($head + "`n" + $experienceSection + "`n" + $activitiesSection + "`n" + $footer)
Set-Content "d:\projects\portfolio\projects.html" ($head + "`n" + $projectsSection + "`n" + $footer)
Set-Content "d:\projects\portfolio\certifications.html" ($head + "`n" + $certificationsSection + "`n" + $footer)
Set-Content "d:\projects\portfolio\contact.html" ($head + "`n" + $contactSection + "`n" + $contactFooter)

Write-Output "Pages generated successfully."
