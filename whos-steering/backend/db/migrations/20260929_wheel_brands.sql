DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'wheel_configurations'::regclass
      AND conname = 'wheel_configurations_brand_check'
      AND pg_get_constraintdef(oid) LIKE '%MERCEDES%'
      AND pg_get_constraintdef(oid) LIKE '%TOYOTA%'
  ) THEN
    ALTER TABLE wheel_configurations DROP CONSTRAINT IF EXISTS wheel_configurations_brand_check;
    ALTER TABLE wheel_configurations ADD CONSTRAINT wheel_configurations_brand_check
      CHECK (brand IN ('BMW','AUDI','INFINITI','MERCEDES','TOYOTA'));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'products'::regclass
      AND conname = 'products_brand_check'
      AND pg_get_constraintdef(oid) LIKE '%MERCEDES%'
      AND pg_get_constraintdef(oid) LIKE '%TOYOTA%'
  ) THEN
    ALTER TABLE products DROP CONSTRAINT IF EXISTS products_brand_check;
    ALTER TABLE products ADD CONSTRAINT products_brand_check
      CHECK (brand IN ('BMW','AUDI','INFINITI','MERCEDES','TOYOTA'));
  END IF;
END $$;
