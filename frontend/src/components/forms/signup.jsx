import { useState } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Stepper,
  Step,
  StepLabel,
  MenuItem,
  Grid,
  Paper,
} from '@mui/material';
import { useForm, FormProvider, Controller } from 'react-hook-form';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const steps = ['Company Information', 'Emissions Data', 'Carbon Credits', 'Confirmation'];

export default function CarbonCreditOnboarding() {
  const [activeStep, setActiveStep] = useState(0);
  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      // Step 1: Company Information
      companyName: '',
      registrationNumber: '',
      industry: '',
      country: '',
      email: '',
      phone: '',
      contactPerson: '',
      
      // Step 2: Emissions Data
      annualEmissions: '',
      scope1Emissions: '',
      scope2Emissions: '',
      scope3Emissions: '',
      reportingYear: '',
      baselineYear: '',
      
      // Step 3: Carbon Credits
      targetCredits: '',
      projectType: '',
      creditSource: '',
      budget: '',
    },
  });

  const handleNext = async () => {
    const isValid = await methods.trigger();
    if (isValid) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = (data) => {
    console.log('Onboarding data:', data);
    // Submit to your backend API
    setActiveStep(steps.length);
  };

  // Step 1: Company Information
  const CompanyInfoForm = () => (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Controller
          name="companyName"
          control={methods.control}
          rules={{ required: 'Company name is required' }}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              fullWidth
              label="Company Name"
              error={!!error}
              helperText={error?.message}
              required
            />
          )}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <Controller
          name="registrationNumber"
          control={methods.control}
          rules={{ required: 'Registration number is required' }}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              fullWidth
              label="Registration Number"
              error={!!error}
              helperText={error?.message}
              required
            />
          )}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <Controller
          name="industry"
          control={methods.control}
          rules={{ required: 'Industry is required' }}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              fullWidth
              select
              label="Industry"
              error={!!error}
              helperText={error?.message}
              required
            >
              <MenuItem value="manufacturing">Manufacturing</MenuItem>
              <MenuItem value="energy">Energy</MenuItem>
              <MenuItem value="transportation">Transportation</MenuItem>
              <MenuItem value="agriculture">Agriculture</MenuItem>
              <MenuItem value="technology">Technology</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </TextField>
          )}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <Controller
          name="country"
          control={methods.control}
          rules={{ required: 'Country is required' }}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              fullWidth
              label="Country"
              error={!!error}
              helperText={error?.message}
              required
            />
          )}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <Controller
          name="contactPerson"
          control={methods.control}
          rules={{ required: 'Contact person is required' }}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              fullWidth
              label="Contact Person"
              error={!!error}
              helperText={error?.message}
              required
            />
          )}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <Controller
          name="email"
          control={methods.control}
          rules={{
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address',
            },
          }}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              fullWidth
              label="Email"
              type="email"
              error={!!error}
              helperText={error?.message}
              required
            />
          )}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <Controller
          name="phone"
          control={methods.control}
          rules={{ required: 'Phone number is required' }}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              fullWidth
              label="Phone Number"
              error={!!error}
              helperText={error?.message}
              required
            />
          )}
        />
      </Grid>
    </Grid>
  );

  // Step 2: Emissions Data
  const EmissionsDataForm = () => (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Enter your company's greenhouse gas emissions data (in tonnes CO₂e)
        </Typography>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Controller
          name="reportingYear"
          control={methods.control}
          rules={{ required: 'Reporting year is required' }}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              fullWidth
              label="Reporting Year"
              type="number"
              error={!!error}
              helperText={error?.message}
              required
            />
          )}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <Controller
          name="baselineYear"
          control={methods.control}
          rules={{ required: 'Baseline year is required' }}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              fullWidth
              label="Baseline Year"
              type="number"
              error={!!error}
              helperText={error?.message}
              required
            />
          )}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <Controller
          name="scope1Emissions"
          control={methods.control}
          rules={{ required: 'Scope 1 emissions required' }}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              fullWidth
              label="Scope 1 Emissions (Direct)"
              type="number"
              error={!!error}
              helperText={error?.message || 'Company-owned vehicles, facilities'}
              required
            />
          )}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <Controller
          name="scope2Emissions"
          control={methods.control}
          rules={{ required: 'Scope 2 emissions required' }}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              fullWidth
              label="Scope 2 Emissions (Indirect)"
              type="number"
              error={!!error}
              helperText={error?.message || 'Purchased electricity, heating'}
              required
            />
          )}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <Controller
          name="scope3Emissions"
          control={methods.control}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              fullWidth
              label="Scope 3 Emissions (Value Chain)"
              type="number"
              error={!!error}
              helperText="Supply chain, distribution (optional)"
            />
          )}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <Controller
          name="annualEmissions"
          control={methods.control}
          rules={{ required: 'Total annual emissions required' }}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              fullWidth
              label="Total Annual Emissions"
              type="number"
              error={!!error}
              helperText={error?.message}
              required
            />
          )}
        />
      </Grid>
    </Grid>
  );

  // Step 3: Carbon Credits
  const CarbonCreditsForm = () => (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Specify your carbon credit requirements and preferences
        </Typography>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Controller
          name="targetCredits"
          control={methods.control}
          rules={{ required: 'Target credits required' }}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              fullWidth
              label="Target Carbon Credits (tonnes CO₂e)"
              type="number"
              error={!!error}
              helperText={error?.message}
              required
            />
          )}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <Controller
          name="budget"
          control={methods.control}
          rules={{ required: 'Budget is required' }}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              fullWidth
              label="Budget (USD)"
              type="number"
              error={!!error}
              helperText={error?.message}
              required
            />
          )}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <Controller
          name="projectType"
          control={methods.control}
          rules={{ required: 'Project type is required' }}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              fullWidth
              select
              label="Preferred Project Type"
              error={!!error}
              helperText={error?.message}
              required
            >
              <MenuItem value="forestry">Forestry & Reforestation</MenuItem>
              <MenuItem value="renewable">Renewable Energy</MenuItem>
              <MenuItem value="agriculture">Sustainable Agriculture</MenuItem>
              <MenuItem value="biodiversity">Biodiversity Conservation</MenuItem>
              <MenuItem value="technology">Carbon Capture Technology</MenuItem>
              <MenuItem value="mixed">Mixed Portfolio</MenuItem>
            </TextField>
          )}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <Controller
          name="creditSource"
          control={methods.control}
          rules={{ required: 'Credit source is required' }}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              fullWidth
              select
              label="Credit Source Marketplace"
              error={!!error}
              helperText={error?.message}
              required
            >
              <MenuItem value="verra">Verra (VCS)</MenuItem>
              <MenuItem value="gold">Gold Standard</MenuItem>
              <MenuItem value="car">Climate Action Reserve</MenuItem>
              <MenuItem value="ace">American Carbon Registry</MenuItem>
              <MenuItem value="any">No Preference</MenuItem>
            </TextField>
          )}
        />
      </Grid>
    </Grid>
  );

  // Step 4: Confirmation
  const ConfirmationView = () => {
    const data = methods.getValues();
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Review Your Information
        </Typography>
        <Paper sx={{ p: 2, mt: 2, bgcolor: 'background.default' }}>
          <Typography variant="subtitle2" gutterBottom>
            Company Information
          </Typography>
          <Typography variant="body2">Company: {data.companyName}</Typography>
          <Typography variant="body2">Industry: {data.industry}</Typography>
          <Typography variant="body2">Contact: {data.email}</Typography>
        </Paper>
        <Paper sx={{ p: 2, mt: 2, bgcolor: 'background.default' }}>
          <Typography variant="subtitle2" gutterBottom>
            Emissions Data
          </Typography>
          <Typography variant="body2">Scope 1: {data.scope1Emissions} tonnes CO₂e</Typography>
          <Typography variant="body2">Scope 2: {data.scope2Emissions} tonnes CO₂e</Typography>
          <Typography variant="body2">
            Total Annual: {data.annualEmissions} tonnes CO₂e
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, mt: 2, bgcolor: 'background.default' }}>
          <Typography variant="subtitle2" gutterBottom>
            Carbon Credits
          </Typography>
          <Typography variant="body2">Target Credits: {data.targetCredits} tonnes</Typography>
          <Typography variant="body2">Project Type: {data.projectType}</Typography>
          <Typography variant="body2">Budget: ${data.budget}</Typography>
        </Paper>
      </Box>
    );
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return <CompanyInfoForm />;
      case 1:
        return <EmissionsDataForm />;
      case 2:
        return <CarbonCreditsForm />;
      case 3:
        return <ConfirmationView />;
      default:
        return 'Unknown step';
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container maxWidth="md">
        <Box sx={{ mt: 8, mb: 8 }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Carbon Credit Firm Onboarding
          </Typography>

          <Stepper activeStep={activeStep} sx={{ mt: 4, mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(handleSubmit)}>
              {activeStep === steps.length ? (
                <Box sx={{ textAlign: 'center', mt: 4 }}>
                  <Typography variant="h5" gutterBottom>
                    Onboarding Complete!
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Your carbon credit registration has been submitted successfully.
                  </Typography>
                </Box>
              ) : (
                <>
                  <Box sx={{ mt: 3, mb: 3 }}>{getStepContent(activeStep)}</Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                    <Button
                      disabled={activeStep === 0}
                      onClick={handleBack}
                      variant="outlined"
                    >
                      Back
                    </Button>

                    {activeStep === steps.length - 1 ? (
                      <Button type="submit" variant="contained" color="primary">
                        Submit
                      </Button>
                    ) : (
                      <Button variant="contained" onClick={handleNext}>
                        Next
                      </Button>
                    )}
                  </Box>
                </>
              )}
            </form>
          </FormProvider>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
