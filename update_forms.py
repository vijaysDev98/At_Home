import os
import glob

files = glob.glob('src/screens/doctor/forms/*.tsx')
files = [f for f in files if f not in ['src/screens/doctor/forms/FormsScreen.tsx', 'src/screens/doctor/forms/ServiceFormRenderer.tsx']]

for file in files:
    with open(file, 'r') as f:
        content = f.read()
    
    # 1. Add handleSubmitForReview to imports if not there
    if 'handleSubmitForReview' not in content and 'formActionHandlers' in content:
        content = content.replace(
            'handleSaveProgress,',
            'handleSaveProgress,\n  handleSubmitForReview,'
        )
    elif 'handleSubmitForReview' not in content:
        content = content.replace(
            'import {',
            'import {\n  handleSubmitForReview,'
        )
        
    # 2. Add submitForReview handler
    if 'const submitForReview = async' not in content:
        save_progress_block = """    // Handle save progress (using centralized handler)
    const saveProgress = async (): Promise<{
      success: boolean;
      error?: string;
    }> => {
      return await handleSaveProgress({
        dispatch,
        state,
        initialData,
        validateForm: () => validateForm().ok,
        scrollRef,
        lastFirstErrorKey,
        errors,
      });
    };"""
        
        submit_for_review_block = """    // Handle submit for review (using centralized handler)
    const submitForReview = async (): Promise<{
      success: boolean;
      error?: string;
    }> => {
      return await handleSubmitForReview({
        dispatch,
        state,
        initialData,
        validateForm: () => validateForm().ok,
        scrollRef,
        lastFirstErrorKey,
        errors,
      });
    };"""
        
        content = content.replace(save_progress_block, save_progress_block + '\n\n' + submit_for_review_block)

    # 3. Add submitForReview to useImperativeHandle
    if 'submitForReview,' not in content and 'useImperativeHandle' in content:
        content = content.replace(
            'saveProgress,',
            'saveProgress,\n      submitForReview,'
        )
        
    with open(file, 'w') as f:
        f.write(content)
        
print("Updated forms successfully.")
