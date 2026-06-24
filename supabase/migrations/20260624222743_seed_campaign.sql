DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM ad_campaigns WHERE title = 'Welcome Campaign') THEN
    INSERT INTO ad_campaigns (
      title, 
      category, 
      environment, 
      status, 
      description,
      promotion_model
    )
    VALUES (
      'Welcome Campaign', 
      'General', 
      'production', 
      'active', 
      'Standard welcome campaign',
      'standard'
    );
  END IF;
END $$;
