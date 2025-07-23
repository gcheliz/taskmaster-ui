# Accessibility Testing Checklist

## Pre-Development Checklist

### Planning Phase
- [ ] Review WCAG 2.1 AA requirements for feature
- [ ] Plan keyboard navigation patterns
- [ ] Design with color contrast in mind
- [ ] Consider screen reader announcements
- [ ] Plan for touch target sizes (44x44px minimum)

### Design Review
- [ ] Color contrast ratios meet requirements
- [ ] Interactive elements are distinguishable
- [ ] Focus indicators are clearly visible
- [ ] Text is readable at 200% zoom
- [ ] No information conveyed by color alone

## Development Checklist

### HTML Structure
- [ ] Use semantic HTML elements
- [ ] Proper heading hierarchy (h1 → h2 → h3)
- [ ] Lists use `<ul>`, `<ol>`, `<li>`
- [ ] Tables have proper headers and captions
- [ ] Forms use `<form>`, `<label>`, `<fieldset>`

### Images and Media
- [ ] All images have appropriate alt text
- [ ] Decorative images use `alt=""`
- [ ] Complex images have detailed descriptions
- [ ] Videos have captions and transcripts
- [ ] Audio content has transcripts

### Forms
- [ ] All inputs have associated labels
- [ ] Required fields are clearly marked
- [ ] Error messages are associated with fields
- [ ] Help text is provided where needed
- [ ] Form validation is accessible

### Interactive Elements
- [ ] All interactive elements are keyboard accessible
- [ ] Focus order follows visual flow
- [ ] No keyboard traps exist
- [ ] Custom controls have proper ARIA
- [ ] Touch targets are at least 44x44 pixels

### Navigation
- [ ] Skip links are provided
- [ ] Navigation is consistent across pages
- [ ] Breadcrumbs show current location
- [ ] Multiple ways to find content
- [ ] Page titles are descriptive

### Dynamic Content
- [ ] Live regions announce changes
- [ ] Loading states are announced
- [ ] Error messages use role="alert"
- [ ] Success messages are announced
- [ ] Progress is communicated

## Testing Procedures

### Automated Testing

#### 1. Run Jest Accessibility Tests
```bash
pnpm test src/tests/accessibility
```

#### 2. Run axe DevTools
- Install axe DevTools browser extension
- Navigate to each page/view
- Run automated scan
- Fix any violations

#### 3. Run WAVE Tool
- Install WAVE browser extension
- Check each page for issues
- Review contrast errors
- Verify structure

### Manual Keyboard Testing

#### Navigation Tests
- [ ] Tab through all interactive elements
- [ ] Tab order matches visual flow
- [ ] Shift+Tab goes backwards
- [ ] No elements are skipped
- [ ] No keyboard traps

#### Interaction Tests
- [ ] Enter/Space activates buttons
- [ ] Arrow keys work in menus
- [ ] Escape closes modals
- [ ] Custom shortcuts work
- [ ] Focus indicators visible

#### Component-Specific Tests
- [ ] **Modals**: Focus trapped, Escape closes
- [ ] **Dropdowns**: Arrow navigation, type-ahead
- [ ] **Tabs**: Arrow keys switch tabs
- [ ] **Tables**: Navigate with arrow keys
- [ ] **Forms**: Tab between fields

### Screen Reader Testing

#### Setup
1. **Windows**: NVDA (free) or JAWS
2. **macOS**: VoiceOver (built-in)
3. **Mobile**: TalkBack (Android) or VoiceOver (iOS)

#### Basic Navigation
- [ ] Headings navigation (H key)
- [ ] Landmarks navigation
- [ ] Links list makes sense
- [ ] Form fields are labeled
- [ ] Tables read correctly

#### Content Tests
- [ ] Page title is announced
- [ ] Headings are descriptive
- [ ] Links have clear purpose
- [ ] Images have alt text
- [ ] Buttons are labeled

#### Dynamic Content
- [ ] Loading states announced
- [ ] Errors are announced
- [ ] Success messages announced
- [ ] Content updates announced
- [ ] Modal opening/closing announced

### Visual Testing

#### Zoom Testing
- [ ] 200% zoom works without horizontal scroll
- [ ] Text remains readable
- [ ] UI doesn't break
- [ ] Touch targets remain usable

#### Color Testing
- [ ] Disable CSS - content readable
- [ ] Use grayscale - UI understandable
- [ ] High contrast mode works
- [ ] Focus indicators visible

#### Responsive Testing
- [ ] Mobile layout accessible
- [ ] Touch targets appropriate
- [ ] Gestures have alternatives
- [ ] Orientation changes work

## Common Issues and Fixes

### Issue: Missing Button Labels
```typescript
// ❌ Bad
<button onClick={handleDelete}>
  <TrashIcon />
</button>

// ✅ Good
<button onClick={handleDelete} aria-label="Delete item">
  <TrashIcon />
</button>
```

### Issue: Form Errors Not Associated
```typescript
// ❌ Bad
<input type="email" />
<div>Invalid email</div>

// ✅ Good
<input type="email" aria-invalid="true" aria-describedby="email-error" />
<div id="email-error" role="alert">Invalid email</div>
```

### Issue: No Loading Indication
```typescript
// ❌ Bad
{isLoading && <Spinner />}

// ✅ Good
{isLoading && (
  <div aria-busy="true" aria-label="Loading data">
    <Spinner />
    <span className="sr-only">Loading data...</span>
  </div>
)}
```

### Issue: Poor Focus Management
```typescript
// ❌ Bad
function openModal() {
  setIsOpen(true)
}

// ✅ Good
function openModal() {
  saveFocus()
  setIsOpen(true)
  // Focus first element in modal
}

function closeModal() {
  setIsOpen(false)
  restoreFocus()
}
```

## Compliance Verification

### WCAG 2.1 AA Criteria
- [ ] **1.1.1** Non-text Content
- [ ] **1.3.1** Info and Relationships
- [ ] **1.4.3** Contrast (Minimum)
- [ ] **1.4.10** Reflow
- [ ] **2.1.1** Keyboard
- [ ] **2.1.2** No Keyboard Trap
- [ ] **2.4.1** Bypass Blocks
- [ ] **2.4.3** Focus Order
- [ ] **2.4.7** Focus Visible
- [ ] **3.3.1** Error Identification
- [ ] **3.3.2** Labels or Instructions
- [ ] **4.1.2** Name, Role, Value

### Final Checks
- [ ] All automated tests pass
- [ ] Manual keyboard testing complete
- [ ] Screen reader testing complete
- [ ] Visual testing complete
- [ ] No critical issues remain
- [ ] Documentation updated

## Reporting Issues

When reporting accessibility issues:

1. **Describe the issue clearly**
   - What is the problem?
   - Who does it affect?
   - What is the impact?

2. **Provide reproduction steps**
   - Browser and assistive technology used
   - Steps to reproduce
   - Expected vs actual behavior

3. **Suggest solutions**
   - Proposed fix
   - WCAG criterion violated
   - Priority level

## Resources

### Tools
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE](https://wave.webaim.org/)
- [Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [NVDA Screen Reader](https://www.nvaccess.org/)

### Documentation
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Resources](https://webaim.org/)

### Training
- [Web Accessibility Course](https://www.w3.org/WAI/fundamentals/accessibility-intro/)
- [Screen Reader Testing Guide](https://webaim.org/articles/screenreader_testing/)
- [Keyboard Testing Guide](https://webaim.org/articles/keyboard/)

---

*Use this checklist for every feature to ensure accessibility compliance.*