export function getCompanyDomain(company: string): string {
  const clean = company
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/\[.*?\]/g, '')
    .trim();

  const domainMap: Record<string, string> = {
    kpmg: 'kpmg.com',
    smartsheet: 'smartsheet.com',
    google: 'google.com',
    microsoft: 'microsoft.com',
    amazon: 'amazon.com',
    cisco: 'cisco.com',
    oracle: 'oracle.com',
    intel: 'intel.com',
    dayforce: 'dayforce.com',
    hp: 'hp.com',
    accenture: 'accenture.com',
    deloitte: 'deloitte.com',
    pwc: 'pwc.com',
    ey: 'ey.com',
    tcs: 'tcs.com',
    infosys: 'infosys.com',
    wipro: 'wipro.com',
    adobe: 'adobe.com',
    salesforce: 'salesforce.com',
    ibm: 'ibm.com',
    qualcomm: 'qualcomm.com',
    nvidia: 'nvidia.com',
    samsung: 'samsung.com',
    apple: 'apple.com',
    uber: 'uber.com',
    goldman: 'goldmansachs.com',
    'goldman sachs': 'goldmansachs.com',
    jpmorgan: 'jpmorgan.com',
    'jp morgan': 'jpmorgan.com',
    morgan: 'morganstanley.com',
    artizent: 'artizent.com',
    dell: 'dell.com',
    sap: 'sap.com',
    visa: 'visa.com',
    mastercard: 'mastercard.com',
    paypal: 'paypal.com',
    walmart: 'walmart.com',
    target: 'target.com',
    atlassian: 'atlassian.com',
    servicenow: 'servicenow.com',
    twilio: 'twilio.com',
    stripe: 'stripe.com',
    intuit: 'intuit.com',
    vmware: 'vmware.com',
    nutanix: 'nutanix.com',
    mathworks: 'mathworks.com',
    synopsys: 'synopsys.com',
    cadence: 'cadence.com',
    arm: 'arm.com',
    broadcom: 'broadcom.com',
    amd: 'amd.com',
    micron: 'micron.com',
    ti: 'ti.com',
    nxp: 'nxp.com',
  };

  for (const [key, domain] of Object.entries(domainMap)) {
    if (clean.includes(key)) return domain;
  }

  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length > 0) {
    const first = words[0].replace(/[^a-z0-9]/g, '');
    if (first.length >= 3) return `${first}.com`;
  }
  return '';
}

export function getCompanyLogoUrl(company: string): string {
  const domain = getCompanyDomain(company);
  if (!domain) return '';
  return `https://logo.clearbit.com/${domain}`;
}

export function getCompanyInitials(name: string): string {
  const clean = name.replace(/[^a-zA-Z0-9]/g, ' ').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}
