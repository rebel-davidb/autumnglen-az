module.exports = {
  name: "Azalea Estates of Fayetteville",
  shortName: "Azalea Estates",
  tagline: "A Premier Assisted Living & Retirement Community",
  description:
    "For more than 30 years, Azalea Estates has been a trusted home for Independent and Assisted Living residents in Fayetteville, Georgia. A blended community where residents live the life they love with compassionate care at every step.",
  url: "https://www.azaleaestatesfayetteville.com",
  contact: {
    phone: "(762) 572-5194",
    phoneRaw: "7625725194",
    email: "info@azaleaestatesfayetteville.com",
    addressLine1: "105 Autumn Glen Circle",
    addressLine2: "Fayetteville, GA 30215",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=105+Autumn+Glen+Cir+Fayetteville+GA+30215"
  },
  social: {
    facebook: "https://www.facebook.com/AzaleaEstatesAssistedLivingAndRetirementCommunity/",
    twitter: "https://twitter.com/",
    pinterest: "https://www.pinterest.com/"
  },
  nav: [
    { label: "About", url: "/about/", allLabel: "About Azalea Estates", children: [
      { label: "Meet Our Team",        url: "/team/" },
      { label: "Resident-Centered Care", url: "/resident-centered-care/" },
      { label: "Cost Calculator",      url: "/cost-calculator/" },
      { label: "Blog",                 url: "/blog/" }
    ]},
    { label: "Living Options", url: "/living-options/", allLabel: "All living options", children: [
      { label: "Independent Living", url: "/living-options/independent-living/" },
      { label: "Assisted Living",    url: "/living-options/assisted-living/" },
      { label: "Respite Care",       url: "/living-options/respite-care/" }
    ]},
    { label: "Wellness",       url: "/wellness/" },
    { label: "Dining",         url: "/dining/" },
    { label: "Floor Plans",    url: "/floor-plans/" },
    { label: "Photo Tour",     url: "/gallery/" },
    { label: "Contact",        url: "/contact/" }
  ]
};
